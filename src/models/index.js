// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { DigioDemo, DigioDemoConnection } = initSchema(schema);

export {
  DigioDemo,
  DigioDemoConnection
};