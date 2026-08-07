export type Game = {
  gameId: string;
  title: string;
  tags: string[];
  genres: string[];
  modes: string[];
  imageUrl?: string;
};

export const GAMES_CATALOG: Game[] = [
  {
    gameId: "valorant",
    title: "Valorant",
    tags: ["Tactical", "FPS", "Hero Shooter", "Esports", "Multiplayer"],
    genres: ["Shooter", "Action"],
    modes: ["Competitive", "Casual", "5v5"],
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop"
  },
  {
    gameId: "cs2",
    title: "Counter-Strike 2",
    tags: ["Tactical", "FPS", "Military", "Esports", "Multiplayer", "Shooter"],
    genres: ["Shooter", "Action"],
    modes: ["Competitive", "Casual", "5v5"],
    imageUrl: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=400&auto=format&fit=crop"
  },
  {
    gameId: "league_of_legends",
    title: "League of Legends",
    tags: ["MOBA", "Strategy", "Esports", "Team-based", "Multiplayer"],
    genres: ["Strategy", "RPG"],
    modes: ["Competitive", "Casual", "5v5"],
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop"
  },
  {
    gameId: "dota_2",
    title: "Dota 2",
    tags: ["MOBA", "Strategy", "Esports", "Team-based", "Hardcore", "Multiplayer"],
    genres: ["Strategy", "RPG"],
    modes: ["Competitive", "Casual", "5v5"],
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400&auto=format&fit=crop"
  },
  {
    gameId: "apex_legends",
    title: "Apex Legends",
    tags: ["Battle Royale", "FPS", "Hero Shooter", "Fast-paced", "Multiplayer"],
    genres: ["Shooter", "Action"],
    modes: ["Competitive", "Casual", "Trios", "Duos"],
    imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=400&auto=format&fit=crop"
  },
  {
    gameId: "overwatch_2",
    title: "Overwatch 2",
    tags: ["Hero Shooter", "FPS", "Team-based", "Objective", "Multiplayer"],
    genres: ["Shooter", "Action"],
    modes: ["Competitive", "Casual", "5v5"],
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=400&auto=format&fit=crop"
  },
  {
    gameId: "rocket_league",
    title: "Rocket League",
    tags: ["Sports", "Physics", "Driving", "Car", "Soccer", "Esports", "Multiplayer"],
    genres: ["Sports", "Arcade"],
    modes: ["Competitive", "Casual", "3v3", "2v2", "1v1"],
    imageUrl: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=400&auto=format&fit=crop"
  }
];
