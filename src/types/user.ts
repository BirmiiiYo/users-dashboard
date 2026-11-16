export type Gender = "male" | "female";

export type UserRole = "admin" | "moderator" | "user";

export interface Hair {
  color: string;
  type: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  address: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  coordinates: Coordinates;
  country: string;
}

export interface Company {
  department: string;
  name: string;
  title: string;
  address: Address;
}

/**
 * Только те поля, которые реально нужны UI.
 * Поля с чувствительными данными (password, ssn, bank, crypto) не запрашиваются
 * у API через `select` — незачем отправлять их в браузер.
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: Gender;
  email: string;
  phone: string;
  username: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: Hair;
  ip: string;
  university: string;
  address: Address;
  company: Company;
  role: UserRole;
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}
