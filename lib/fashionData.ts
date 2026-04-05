export type FashionStore = {
  id: string;
  name: string;
  category: 'Boutique' | 'Designer' | 'Luxury' | 'Contemporary' | 'Menswear' | 'Formal';
  description: string;
  location: string;
  address: string;
  phone: string;
  specialties: string[];
  brands: string[];
  image: string;
  hours?: string;
  website?: string;
};

export const fashionStores: FashionStore[] = [
  {
    id: 'fs1',
    name: 'The Sanctuary Boutique',
    category: 'Boutique',
    description: 'Curated collection of African and international designer clothing, perfect for Durban July',
    location: 'Florida Road, Morningside',
    address: '123 Florida Road, Durban',
    phone: '+27 31 309 9999',
    specialties: ['Designer wear', 'African designers', 'Evening wear', 'Accessories'],
    brands: ['Palse by Pali Solanki', 'Gert-Johan Coetzee', 'Maxhosa by Laduma'],
    image: 'https://api.a0.dev/assets/image?text=luxury+boutique+durban+fashion&aspect=16:9&seed=fs1',
    hours: '10:00 - 18:00 (Daily)',
    website: 'www.thesanctuaryboutique.co.za',
  },
  {
    id: 'fs2',
    name: 'Urbanboutique Durban',
    category: 'Designer',
    description: 'Contemporary designer wear and exclusive collections from South African fashion designers',
    location: 'The Pavilion, Umhlanga',
    address: 'The Pavilion Shopping Centre, Umhlanga',
    phone: '+27 31 562 1234',
    specialties: ['South African designers', 'Contemporary fashion', 'Statement pieces'],
    brands: ['Rich Mnisi', 'Thebe Magubane', 'Laduma Ngxokolo'],
    image: 'https://api.a0.dev/assets/image?text=contemporary+designer+boutique+durban&aspect=16:9&seed=fs2',
    hours: '09:00 - 19:00 (Daily)',
  },
  {
    id: 'fs3',
    name: 'Menswear Capital',
    category: 'Menswear',
    description: 'Premium menswear collection featuring tailored suits, formal wear, and designer brands',
    location: 'Westwood Mall, Durban',
    address: 'Westwood Mall, Durban',
    phone: '+27 31 263 8888',
    specialties: ['Tailored suits', 'Formal wear', 'Italian brands', 'Bespoke tailoring'],
    brands: ['Hugo Boss', 'Ted Baker', 'Oliver Sweeney'],
    image: 'https://api.a0.dev/assets/image?text=premium+menswear+durban+suits&aspect=16:9&seed=fs3',
    hours: '09:00 - 18:00 (Daily)',
  },
  {
    id: 'fs4',
    name: 'Luxe Evening Couture',
    category: 'Luxury',
    description: 'Exclusive evening gowns and couture pieces designed for red carpet moments like Durban July',
    location: 'Umhlanga Rocks',
    address: 'Umhlanga Rocks, Durban',
    phone: '+27 31 561 7777',
    specialties: ['Evening gowns', 'Couture', 'Bespoke design', 'Bridal'],
    brands: ['Custom designs', 'Local couturiers'],
    image: 'https://api.a0.dev/assets/image?text=luxury+evening+gowns+durban&aspect=16:9&seed=fs4',
    hours: '10:00 - 17:00 (Closed Sundays)',
    website: 'www.luxeveningcouture.co.za',
  },
  {
    id: 'fs5',
    name: 'Style Statement',
    category: 'Contemporary',
    description: 'Trendy fashion-forward clothing with focus on seasonal collections and emerging designers',
    location: 'Pavilion Mall, Umhlanga',
    address: 'The Pavilion, Umhlanga Ridge',
    phone: '+27 31 569 4444',
    specialties: ['Seasonal trends', 'Statement fashion', 'Accessories', 'Jewelry'],
    brands: ['ASOS', 'Superbalist', 'Local emerging designers'],
    image: 'https://api.a0.dev/assets/image?text=trendy+fashion+boutique+durban&aspect=16:9&seed=fs5',
    hours: '09:00 - 19:00 (Daily)',
  },
  {
    id: 'fs6',
    name: 'Accessory Heaven',
    category: 'Boutique',
    description: 'Premium accessories including shoes, handbags, jewelry, and statement pieces for Durban July',
    location: 'Florida Road, Morningside',
    address: '456 Florida Road, Durban',
    phone: '+27 31 312 5555',
    specialties: ['Designer handbags', 'Luxury shoes', 'Statement jewelry', 'Heels'],
    brands: ['Giuseppe Zanotti', 'Gianvito Rossi', 'Local jewelers'],
    image: 'https://api.a0.dev/assets/image?text=luxury+accessories+handbags+jewelry&aspect=16:9&seed=fs6',
    hours: '10:00 - 18:00 (Daily)',
  },
  {
    id: 'fs7',
    name: 'The African Designer Collective',
    category: 'Designer',
    description: 'Celebrates African fashion with contemporary designs from the continent\'s best designers',
    location: 'Umhlanga, Durban',
    address: 'Umhlanga, Durban',
    phone: '+27 31 566 3333',
    specialties: ['African designers', 'Traditional meets contemporary', 'Handcrafted pieces'],
    brands: ['Gert-Johan Coetzee', 'Sindiso Khumalo', 'Amina Taiga'],
    image: 'https://api.a0.dev/assets/image?text=african+designer+fashion+collective&aspect=16:9&seed=fs7',
    hours: '10:00 - 17:00 (Daily)',
  },
  {
    id: 'fs8',
    name: 'Formal Affairs',
    category: 'Formal',
    description: 'Specializing in formal wear for events - perfect for Durban July races, parties & brunches',
    location: 'Westwood, Durban',
    address: 'Westwood Mall, Durban',
    phone: '+27 31 261 9999',
    specialties: ['Formal dresses', 'Race wear', 'Fascinators & hats', 'Styling advice'],
    brands: ['Fallon London', 'Philip Treacy', 'Local designers'],
    image: 'https://api.a0.dev/assets/image?text=formal+wear+race+day+fascinators&aspect=16:9&seed=fs8',
    hours: '09:30 - 17:30 (Daily)',
  },
];
