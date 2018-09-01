/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 12:43:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-multi-type-array-int.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th September 2018 9:33:48 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoMultiTypeArrayBase } from './xyo-multi-type-array-base';
import { XyoArrayCreator } from '../xyo-array-base';
import { XyoResult } from '../../xyo-result';
import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XyoObject } from '../../xyo-object';

class XyoMultiTypeArrayIntCreator extends XyoArrayCreator {

  get minor () {
    return 0x06;
  }

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(4);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt32BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, false, 4);
    const arrayResult = unpackedArray.array;
    if (arrayResult.hasError()) {
      return XyoResult.withError(arrayResult.error!) as XyoResult<XyoMultiTypeArrayInt>;
    }

    const unpackedArrayObject = new XyoMultiTypeArrayInt(arrayResult.value!);
    return XyoResult.withValue(unpackedArrayObject);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoMultiTypeArrayInt extends XyoMultiTypeArrayBase {

  public static creator = new XyoMultiTypeArrayIntCreator();

  public static createFromPacked (buffer: Buffer) {
    return XyoMultiTypeArrayInt.creator.createFromPacked(buffer);
  }

  constructor (public readonly array: XyoObject[]) {
    super();
  }

  get id () {
    return XyoMultiTypeArrayInt.creator.id;
  }

  get sizeIdentifierSize () {
    return XyoMultiTypeArrayInt.creator.sizeOfBytesToGetSize;
  }
}
