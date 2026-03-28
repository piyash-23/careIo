export const SERVICES = [
  {
    id: 'baby-care',
    title: 'Baby Care',
    description: 'Professional babysitting and childcare services. Our caretakers are trained to handle infants and toddlers with love and safety.',
    pricePerHour: 15,
    imageUrl: 'https://picsum.photos/seed/baby/800/600'
  },
  {
    id: 'elderly-care',
    title: 'Elderly Care',
    description: 'Compassionate care for the elderly. We provide assistance with daily activities, medication reminders, and companionship.',
    pricePerHour: 20,
    imageUrl: 'https://picsum.photos/seed/elderly/800/600'
  },
  {
    id: 'sick-care',
    title: 'Sick People Service',
    description: 'Specialized care for individuals recovering from illness or surgery. Our caretakers ensure a comfortable recovery at home.',
    pricePerHour: 25,
    imageUrl: 'https://picsum.photos/seed/sick/800/600'
  }
];

export const LOCATIONS = {
  divisions: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'],
  districts: {
    'Dhaka': ['Dhaka', 'Gazipur', 'Narayanganj'],
    'Chittagong': ['Chittagong', 'Cox\'s Bazar', 'Feni']
  },
  cities: {
    'Dhaka': ['Dhaka North', 'Dhaka South'],
    'Chittagong': ['Chittagong City']
  },
  areas: {
    'Dhaka North': ['Gulshan', 'Banani', 'Uttara'],
    'Dhaka South': ['Dhanmondi', 'Motijheel']
  }
};
