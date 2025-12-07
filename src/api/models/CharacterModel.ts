export interface Character {
  id: number;
  race_logo: string;
  class_logo: string;
  name: string;
  race: string;
  gender: string;
  class: string;
  level: number;
  xp: number;
  money: number;
  flags: string;
  note: string;
  race_id: number;
  class_id: number;
}

export interface Characters {
  characters: Character[];
  total_quantity: number;
}

