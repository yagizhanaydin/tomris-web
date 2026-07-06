/** AB ülkeleri — yalnızca şehir, ilçe yok */
export const EU_COUNTRIES: Record<string, string[]> = {
  Almanya: ["Berlin", "Hamburg", "Münih", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"],
  Avusturya: ["Viyana", "Graz", "Linz", "Salzburg", "Innsbruck"],
  Belçika: ["Brüksel", "Antwerp", "Gent", "Charleroi", "Liège"],
  Bulgaristan: ["Sofya", "Plovdiv", "Varna", "Burgas"],
  Çekya: ["Prag", "Brno", "Ostrava", "Plzeň"],
  Danimarka: ["Kopenhag", "Aarhus", "Odense", "Aalborg"],
  Estonya: ["Tallinn", "Tartu", "Narva"],
  Finlandiya: ["Helsinki", "Tampere", "Turku", "Oulu"],
  Fransa: ["Paris", "Lyon", "Marsilya", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
  Hırvatistan: ["Zagreb", "Split", "Rijeka", "Osijek"],
  Hollanda: ["Amsterdam", "Rotterdam", "Lahey", "Utrecht", "Eindhoven", "Groningen"],
  İrlanda: ["Dublin", "Cork", "Galway", "Limerick"],
  İspanya: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga", "Zaragoza"],
  İsveç: ["Stockholm", "Göteborg", "Malmö", "Uppsala"],
  İtalya: ["Roma", "Milano", "Napoli", "Torino", "Palermo", "Bologna", "Firenze", "Venedik"],
  Kıbrıs: ["Lefkoşa", "Limassol", "Larnaka", "Girne"],
  Letonya: ["Riga", "Daugavpils", "Liepāja"],
  Litvanya: ["Vilnius", "Kaunas", "Klaipėda"],
  Lüksemburg: ["Lüksemburg", "Esch-sur-Alzette"],
  Macaristan: ["Budapeşte", "Debrecen", "Szeged", "Pécs"],
  Malta: ["Valletta", "Birkirkara", "Sliema"],
  Polonya: ["Varşova", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk"],
  Portekiz: ["Lizbon", "Porto", "Braga", "Coimbra"],
  Romanya: ["Bükreş", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"],
  Slovakya: ["Bratislava", "Košice", "Prešov"],
  Slovenya: ["Ljubljana", "Maribor", "Celje"],
  Yunanistan: ["Atina", "Selanik", "Patras", "Heraklion"],
};

export const EU_COUNTRY_LIST = Object.keys(EU_COUNTRIES).sort((a, b) =>
  a.localeCompare(b, "tr")
);

export function getEuCities(country: string): string[] {
  return EU_COUNTRIES[country] ?? [];
}

/** İngilizce ülke adları */
export const COUNTRY_EN: Record<string, string> = {
  Türkiye: "Turkey",
  Almanya: "Germany",
  Avusturya: "Austria",
  Belçika: "Belgium",
  Bulgaristan: "Bulgaria",
  Çekya: "Czechia",
  Danimarka: "Denmark",
  Estonya: "Estonia",
  Finlandiya: "Finland",
  Fransa: "France",
  Hırvatistan: "Croatia",
  Hollanda: "Netherlands",
  İrlanda: "Ireland",
  İspanya: "Spain",
  İsveç: "Sweden",
  İtalya: "Italy",
  Kıbrıs: "Cyprus",
  Letonya: "Latvia",
  Litvanya: "Lithuania",
  Lüksemburg: "Luxembourg",
  Macaristan: "Hungary",
  Malta: "Malta",
  Polonya: "Poland",
  Portekiz: "Portugal",
  Romanya: "Romania",
  Slovakya: "Slovakia",
  Slovenya: "Slovenia",
  Yunanistan: "Greece",
};
