import { IUserEntity } from "./user-interface";

export class User implements IUserEntity { 

  id?: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;

  constructor(data: Partial<IUserEntity>) {
    Object.assign(this, data);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      created_at: this.created_at,
      updated_at: this.updated_at,
    }
  }
}