// Realistic Zambian provinces + districts (subset of real districts per province)
// Coordinates are approximate province-centre lat/lng for map pins.

export interface Province {
  code: string;
  name: string;
  lat: number;
  lng: number;
  classification: "urban-heavy" | "mixed" | "rural-heavy";
  mostWanted: boolean;
}

export const PROVINCES: Province[] = [
  { code: "LSK", name: "Lusaka", lat: -15.3875, lng: 28.3228, classification: "urban-heavy", mostWanted: true },
  { code: "CB", name: "Copperbelt", lat: -12.8, lng: 28.2, classification: "urban-heavy", mostWanted: true },
  { code: "SO", name: "Southern", lat: -16.8, lng: 27.15, classification: "mixed", mostWanted: true },
  { code: "CE", name: "Central", lat: -14.45, lng: 28.68, classification: "mixed", mostWanted: false },
  { code: "EA", name: "Eastern", lat: -13.65, lng: 32.65, classification: "mixed", mostWanted: false },
  { code: "NW", name: "North-Western", lat: -13.45, lng: 24.35, classification: "rural-heavy", mostWanted: false },
  { code: "WE", name: "Western", lat: -15.35, lng: 23.15, classification: "rural-heavy", mostWanted: false },
  { code: "NO", name: "Northern", lat: -10.2, lng: 31.2, classification: "rural-heavy", mostWanted: false },
  { code: "MU", name: "Muchinga", lat: -11.8, lng: 32.05, classification: "rural-heavy", mostWanted: false },
  { code: "LP", name: "Luapula", lat: -10.85, lng: 28.7, classification: "rural-heavy", mostWanted: false },
];

export const DISTRICTS: Record<string, string[]> = {
  LSK: ["Lusaka", "Kafue", "Chongwe", "Chilanga", "Luangwa", "Rufunsa"],
  CB: ["Ndola", "Kitwe", "Chingola", "Mufulira", "Luanshya", "Kalulushi", "Chililabombwe", "Masaiti", "Lufwanyama"],
  SO: ["Livingstone", "Choma", "Mazabuka", "Monze", "Kalomo", "Siavonga", "Namwala", "Kazungula", "Gwembe"],
  CE: ["Kabwe", "Kapiri Mposhi", "Mkushi", "Serenje", "Mumbwa", "Chibombo", "Chisamba", "Itezhi-Tezhi"],
  EA: ["Chipata", "Katete", "Petauke", "Lundazi", "Nyimba", "Chadiza", "Mambwe", "Sinda"],
  NW: ["Solwezi", "Mwinilunga", "Zambezi", "Kasempa", "Mufumbwe", "Kabompo", "Chavuma"],
  WE: ["Mongu", "Senanga", "Kaoma", "Kalabo", "Lukulu", "Sesheke", "Limulunga"],
  NO: ["Kasama", "Mbala", "Mpika", "Luwingu", "Mungwi", "Chilubi", "Mporokoso"],
  MU: ["Chinsali", "Mpika", "Isoka", "Nakonde", "Mafinga", "Shiwang'andu"],
  LP: ["Mansa", "Samfya", "Kawambwa", "Mwense", "Nchelenge", "Milenge"],
};

export function getDistrictsByProvinceCode(code: string): string[] {
  return DISTRICTS[code] ?? [];
}

export const MOST_WANTED_STATIONS = [
  { station: "Lusaka Urban", province: "Lusaka", demandIndex: 98 },
  { station: "Ndola Central", province: "Copperbelt", demandIndex: 91 },
  { station: "Kitwe Central", province: "Copperbelt", demandIndex: 88 },
  { station: "Livingstone Town", province: "Southern", demandIndex: 82 },
  { station: "Kabwe Central", province: "Central", demandIndex: 74 },
  { station: "Chipata Urban", province: "Eastern", demandIndex: 68 },
];
