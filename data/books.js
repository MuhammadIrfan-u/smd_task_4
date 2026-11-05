export const books = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    year: 2018,
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
    similarBookIds: ['4', '2']
  },
  {
    id: '2',
    title: 'Deep Work',
    author: 'Cal Newport',
    genre: 'Productivity',
    year: 2016,
    description: 'Rules for Focused Success in a Distracted World.',
    similarBookIds: ['1', '8']
  },
  {
    id: '3',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    genre: 'Finance',
    year: 2020,
    description: 'Timeless lessons on wealth, greed, and happiness.',
    similarBookIds: ['5', '9']
  },
  {
    id: '4',
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    genre: 'Self-Help',
    year: 1989,
    description: 'Powerful lessons in personal change.',
    similarBookIds: ['1', '2']
  },
  {
    id: '5',
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    genre: 'Finance',
    year: 1997,
    description: 'What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not!',
    similarBookIds: ['3', '10']
  },
  {
    id: '6',
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    genre: 'Finance',
    year: 1937,
    description: 'The landmark bestseller on wealth and success.',
    similarBookIds: ['5', '3']
  },
  {
    id: '7',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    genre: 'History',
    year: 2011,
    description: 'Explores the history of our species from the Stone Age up to the twenty-first century.',
    similarBookIds: ['11', '12']
  },
  {
    id: '8',
    title: 'Essentialism',
    author: 'Greg McKeown',
    genre: 'Productivity',
    year: 2014,
    description: 'The Disciplined Pursuit of Less.',
    similarBookIds: ['2', '1']
  },
  {
    id: '9',
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    genre: 'Finance',
    year: 1949,
    description: 'The definitive book on value investing.',
    similarBookIds: ['3', '6']
  },
  {
    id: '10',
    title: 'The 4-Hour Workweek',
    author: 'Timothy Ferriss',
    genre: 'Productivity',
    year: 2007,
    description: 'Escape 9-5, live anywhere, and join the new rich.',
    similarBookIds: ['2', '8']
  },
  {
    id: '11',
    title: 'Homo Deus',
    author: 'Yuval Noah Harari',
    genre: 'History',
    year: 2015,
    description: 'A brief history of tomorrow.',
    similarBookIds: ['7', '12']
  },
  {
    id: '12',
    title: 'Guns, Germs, and Steel',
    author: 'Jared Diamond',
    genre: 'History',
    year: 1997,
    description: 'The fates of human societies.',
    similarBookIds: ['7', '11']
  },
  {
    id: '13',
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Science Fiction',
    year: 1965,
    description: 'A masterpiece of science fiction set on the desert planet Arrakis.',
    similarBookIds: ['14', '15']
  },
  {
    id: '14',
    title: 'Foundation',
    author: 'Isaac Asimov',
    genre: 'Science Fiction',
    year: 1951,
    description: 'The first novel in the classic Foundation series.',
    similarBookIds: ['13', '15']
  },
  {
    id: '15',
    title: 'Ender\'s Game',
    author: 'Orson Scott Card',
    genre: 'Science Fiction',
    year: 1985,
    description: 'A brilliant young boy is recruited to fight a future alien war.',
    similarBookIds: ['13', '14']
  }
];

export const getBookById = (id) => {
  return books.find((book) => book.id === id);
};

export const getSimilarBooks = (bookId) => {
  const book = getBookById(bookId);
  if (!book) return [];
  return book.similarBookIds.map(id => getBookById(id)).filter(Boolean).slice(0, 2);
};
