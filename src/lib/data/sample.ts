export const household = {
  name: "Ward Fam",
  members: ["Thomas", "Alex", "Maya", "Nora"],
};

export const events = [
  {
    id: "evt-1",
    title: "Mother's Day",
    date: "Sat, May 16",
    month: "May 2026",
    time: "All day",
    category: "Holiday",
    color: "#FF4D4D",
    todos: 0,
  },
  {
    id: "evt-2",
    title: "Thomas Birthday",
    date: "Fri, Nov 6",
    month: "November 2026",
    time: "All day",
    category: "Birthday",
    color: "#EC4899",
    todos: 1,
  },
];

export const todos = [
  {
    id: "todo-1",
    title: "Book a tee time",
    due: "Thomas Birthday",
    period: "Someday",
    completed: false,
    eventId: "evt-2",
  },
  {
    id: "todo-2",
    title: "Install car seat",
    due: "Done Apr 21",
    period: "Done",
    completed: true,
    eventId: null,
  },
];

export const meals = [
  { id: "meal-1", name: "Breakfast Burrito", ingredients: 1, slot: "Breakfast" },
  { id: "meal-2", name: "Grilled Chicken, Potatoes, Broccoli", ingredients: 3, slot: "Dinner" },
  { id: "meal-3", name: "Meatballs (Crockpot)", ingredients: 0, slot: "Dinner" },
  { id: "meal-4", name: "Overnight Oats", ingredients: 0, slot: "Breakfast" },
  { id: "meal-5", name: "Teriyaki Chicken", ingredients: 2, slot: "Dinner" },
];

export const mealPlan = [
  { day: "Sat 16", breakfast: null, lunch: null, dinner: null, snack: null },
  { day: "Sun 17", breakfast: null, lunch: null, dinner: null, snack: null },
  { day: "Mon 18", breakfast: "Overnight Oats", lunch: null, dinner: "Teriyaki Chicken", snack: null },
  { day: "Tue 19", breakfast: null, lunch: null, dinner: null, snack: null },
  { day: "Wed 20", breakfast: null, lunch: null, dinner: "Grilled Chicken", snack: null },
  { day: "Thu 21", breakfast: null, lunch: null, dinner: null, snack: null },
  { day: "Fri 22", breakfast: null, lunch: null, dinner: null, snack: null },
];

export const groceries = [
  { id: "g-1", name: "Breakfast Burrito", quantity: "1", checked: false, source: "meal" },
  { id: "g-2", name: "Milk", quantity: "", checked: false, source: "manual" },
  { id: "g-3", name: "White rice", quantity: "2 box", checked: false, source: "manual" },
  { id: "g-4", name: "Veggie straws", quantity: "2 bags", checked: false, source: "manual" },
  { id: "g-5", name: "Avocados", quantity: "4", checked: true, source: "manual" },
];
