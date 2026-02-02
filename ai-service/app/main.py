import logging
import os
import re
from datetime import datetime
from typing import List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

logger = logging.getLogger("gamesphere.ai")

app = FastAPI(title="GameSphere AI Service")

STOPWORDS = {
    "the",
    "and",
    "with",
    "for",
    "to",
    "of",
    "a",
    "an",
    "in",
    "on",
    "at",
    "is",
    "are",
    "as",
    "from",
    "it",
    "this",
    "that",
    "be",
    "by",
    "or",
    "my",
    "your",
    "our",
    "we",
    "you",
}


class HealthStatus(BaseModel):
    status: str
    timestamp: str


class MatchScoreRequest(BaseModel):
    player_skill: int = Field(ge=1, le=10)
    opponent_skill: int = Field(ge=1, le=10)
    same_region: bool = True
    latency_ms: int = Field(ge=0, le=300)


class MatchScoreResponse(BaseModel):
    score: float
    rationale: str


class GameHistoryItem(BaseModel):
    game_id: str
    hours_played: Optional[float] = Field(default=0, ge=0)
    liked: Optional[bool] = None
    tags: List[str] = Field(default_factory=list)


class Preferences(BaseModel):
    genres: List[str] = Field(default_factory=list)
    modes: List[str] = Field(default_factory=list)
    platforms: List[str] = Field(default_factory=list)
    playstyle: List[str] = Field(default_factory=list)
    free_text: Optional[str] = None
    region: Optional[str] = None


class MatchSuccessItem(BaseModel):
    teammate_id: str
    game_id: str
    success_score: float = Field(ge=0, le=1)


class CommunityProfile(BaseModel):
    user_id: str
    history: List[GameHistoryItem] = Field(default_factory=list)
    preferences: Optional[Preferences] = None


class GameCatalogItem(BaseModel):
    game_id: str
    title: str
    tags: List[str] = Field(default_factory=list)
    genres: List[str] = Field(default_factory=list)
    modes: List[str] = Field(default_factory=list)


class RecommendRequest(BaseModel):
    user_id: str
    user_history: List[GameHistoryItem] = Field(default_factory=list)
    preferences: Optional[Preferences] = None
    match_success: List[MatchSuccessItem] = Field(default_factory=list)
    community_profiles: List[CommunityProfile] = Field(default_factory=list)
    games_catalog: List[GameCatalogItem] = Field(default_factory=list)


class RecommendationItem(BaseModel):
    id: str
    score: float
    reason: str


class RecommendResponse(BaseModel):
    games: List[RecommendationItem]
    teammates: List[RecommendationItem]
    extracted_interests: List[str]


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Avoid leaking internals while still logging for observability.
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


@app.get("/health", response_model=HealthStatus)
async def get_health():
    return HealthStatus(status="ok", timestamp=datetime.utcnow().isoformat())


@app.post("/matchmaking/score", response_model=MatchScoreResponse)
async def score_match(request: MatchScoreRequest):
    # Simple heuristic: prioritize close skill match, reward same region and low latency.
    skill_gap = abs(request.player_skill - request.opponent_skill)
    skill_score = max(0.0, 1.0 - (skill_gap / 10))
    latency_penalty = min(request.latency_ms / 300, 1.0)
    region_bonus = 0.1 if request.same_region else 0.0

    score = max(0.0, min(1.0, skill_score + region_bonus - latency_penalty * 0.2))

    if score < 0.2:
        raise HTTPException(status_code=422, detail="Match quality too low.")

    rationale = (
        f"Skill gap {skill_gap}, "
        f"latency {request.latency_ms}ms, "
        f"same region {request.same_region}"
    )

    return MatchScoreResponse(score=round(score, 3), rationale=rationale)


@app.post("/recommend", response_model=RecommendResponse)
async def recommend_games(request: RecommendRequest, x_api_key: Optional[str] = Header(default=None)):
    require_api_key(x_api_key)

    target_history = request.user_history
    target_game_ids = {item.game_id for item in target_history}
    interests = extract_interests(request.preferences, target_history)

    collaborative_scores = compute_collaborative_scores(
        target_history,
        request.community_profiles
    )

    content_scores = compute_content_scores(
        target_game_ids,
        interests,
        request.games_catalog
    )

    game_recommendations = merge_game_scores(
        target_game_ids,
        collaborative_scores,
        content_scores
    )

    teammate_recommendations = compute_teammates(
        request.match_success,
        request.community_profiles,
        target_history
    )

    return RecommendResponse(
        games=game_recommendations,
        teammates=teammate_recommendations,
        extracted_interests=interests
    )


def require_api_key(provided_key: Optional[str]) -> None:
    expected_key = os.getenv("AI_API_KEY")
    if expected_key and provided_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key.")


def extract_interests(
    preferences: Optional[Preferences],
    history: List[GameHistoryItem]
) -> List[str]:
    tokens: List[str] = []
    if preferences:
        tokens.extend([item.lower() for item in preferences.genres])
        tokens.extend([item.lower() for item in preferences.modes])
        tokens.extend([item.lower() for item in preferences.platforms])
        tokens.extend([item.lower() for item in preferences.playstyle])
        if preferences.free_text:
            tokens.extend(tokenize(preferences.free_text))

    for item in history:
        tokens.extend([tag.lower() for tag in item.tags])

    normalized = [token for token in tokens if token and token not in STOPWORDS]
    unique = list(dict.fromkeys(normalized))
    return unique[:20]


def tokenize(text: str) -> List[str]:
    words = re.findall(r"[a-zA-Z0-9#\+]{3,}", text.lower())
    return [word for word in words if word not in STOPWORDS]


def compute_collaborative_scores(
    target_history: List[GameHistoryItem],
    community: List[CommunityProfile]
) -> dict:
    if not community:
        return {}

    users = [target_history] + [profile.history for profile in community]
    game_ids = sorted({item.game_id for history in users for item in history})
    if not game_ids:
        return {}

    matrix = np.zeros((len(users), len(game_ids)), dtype=float)
    game_index = {game_id: idx for idx, game_id in enumerate(game_ids)}

    for user_idx, history in enumerate(users):
        for item in history:
            score = min(1.0, (item.hours_played or 0) / 50)
            if item.liked is True:
                score = 1.0
            elif item.liked is False:
                score = min(score, 0.1)
            matrix[user_idx, game_index[item.game_id]] = max(
                matrix[user_idx, game_index[item.game_id]],
                score
            )

    target_vector = matrix[0]
    if np.linalg.norm(target_vector) == 0:
        return {}

    similarities = []
    for idx in range(1, matrix.shape[0]):
        other_vector = matrix[idx]
        denominator = np.linalg.norm(target_vector) * np.linalg.norm(other_vector)
        similarity = float(np.dot(target_vector, other_vector) / denominator) if denominator else 0.0
        similarities.append(similarity)

    if not any(similarities):
        return {}

    scores: dict = {}
    for game_idx, game_id in enumerate(game_ids):
        if target_vector[game_idx] > 0:
            continue
        numerator = 0.0
        denominator = 0.0
        for user_idx, similarity in enumerate(similarities, start=1):
            rating = matrix[user_idx, game_idx]
            if rating > 0:
                numerator += similarity * rating
                denominator += similarity
        if denominator > 0:
            scores[game_id] = numerator / denominator

    return scores


def compute_content_scores(
    target_game_ids: set,
    interests: List[str],
    catalog: List[GameCatalogItem]
) -> dict:
    if not catalog or not interests:
        return {}

    interest_set = {interest.lower() for interest in interests}
    scores: dict = {}
    for game in catalog:
        if game.game_id in target_game_ids:
            continue
        tags = [item.lower() for item in (game.tags + game.genres + game.modes)]
        overlap = interest_set.intersection(tags)
        if overlap:
            scores[game.game_id] = len(overlap) / max(1, len(interest_set))
    return scores


def merge_game_scores(
    target_game_ids: set,
    collaborative: dict,
    content: dict
) -> List[RecommendationItem]:
    combined = {}
    for game_id, score in collaborative.items():
        combined[game_id] = max(combined.get(game_id, 0), score)
    for game_id, score in content.items():
        combined[game_id] = max(combined.get(game_id, 0), score * 0.7)

    sorted_games = sorted(combined.items(), key=lambda item: item[1], reverse=True)[:5]
    recommendations = []
    for game_id, score in sorted_games:
        reason = "Recommended by similar players." if game_id in collaborative else "Matches your interests."
        recommendations.append(RecommendationItem(id=game_id, score=round(score, 3), reason=reason))

    return recommendations


def compute_teammates(
    match_success: List[MatchSuccessItem],
    community: List[CommunityProfile],
    target_history: List[GameHistoryItem]
) -> List[RecommendationItem]:
    if match_success:
        scores = {}
        for item in match_success:
            scores.setdefault(item.teammate_id, []).append(item.success_score)
        averaged = {
            teammate_id: float(sum(values) / len(values)) for teammate_id, values in scores.items()
        }
        sorted_teammates = sorted(averaged.items(), key=lambda item: item[1], reverse=True)[:5]
        return [
            RecommendationItem(
                id=teammate_id,
                score=round(score, 3),
                reason="Strong recent match performance."
            )
            for teammate_id, score in sorted_teammates
        ]

    if not community:
        return []

    target_games = {item.game_id for item in target_history}
    scores = {}
    for profile in community:
        overlap = target_games.intersection({item.game_id for item in profile.history})
        if overlap:
            scores[profile.user_id] = len(overlap) / max(1, len(target_games))

    sorted_teammates = sorted(scores.items(), key=lambda item: item[1], reverse=True)[:5]
    return [
        RecommendationItem(
            id=teammate_id,
            score=round(score, 3),
            reason="Similar game interests."
        )
        for teammate_id, score in sorted_teammates
    ]
