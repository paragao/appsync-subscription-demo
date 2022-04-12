import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";



export declare class DigioDemo {
  readonly createdAt?: string | null;
  readonly id: string;
  readonly originIP?: string | null;
  readonly status: string;
  readonly user: string;
  constructor(init: ModelInit<DigioDemo>);
}

export declare class DigioDemoConnection {
  readonly items?: (DigioDemo | null)[] | null;
  readonly nextToken?: string | null;
  constructor(init: ModelInit<DigioDemoConnection>);
}



