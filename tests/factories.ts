import type { User } from "@/types/user";

/** Минимальная фабрика: тесты не должны зависеть от полного ответа dummyjson. */
export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    firstName: "Emily",
    lastName: "Johnson",
    maidenName: "Smith",
    age: 28,
    gender: "female",
    email: "emily.johnson@x.dummyjson.com",
    phone: "+81 965-431-3024",
    username: "emilys",
    birthDate: "1996-5-30",
    image: "https://dummyjson.com/icon/emilys/128",
    bloodGroup: "O-",
    height: 193.24,
    weight: 63.16,
    eyeColor: "Green",
    hair: { color: "Brown", type: "Curly" },
    ip: "42.48.100.32",
    university: "University of Wisconsin--Madison",
    address: {
      address: "626 Main Street",
      city: "Phoenix",
      state: "Mississippi",
      stateCode: "MS",
      postalCode: "29112",
      coordinates: { lat: -77.16213, lng: -92.08482 },
      country: "United States",
    },
    company: {
      department: "Engineering",
      name: "Dooley, Kozey and Cronin",
      title: "Sales Manager",
      address: {
        address: "263 Tenth Street",
        city: "San Francisco",
        state: "Wisconsin",
        stateCode: "WI",
        postalCode: "37657",
        coordinates: { lat: 71.81452, lng: -4.84223 },
        country: "United States",
      },
    },
    role: "admin",
    ...overrides,
  };
}
