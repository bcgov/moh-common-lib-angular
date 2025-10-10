// TODO: code refactor
import { v4 as uuidv4 } from 'uuid';

/**
 * Base class.  Components extend this class to have object IDs.
 * NPM package dependencies:
 *  a) moment
 */
export class Base {

  /** An identifier for parents to keep track of components */
  public objectId: string = uuidv4();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
}

