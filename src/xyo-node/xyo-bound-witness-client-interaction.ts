/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 27th September 2018 9:48:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-client-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 27th September 2018 9:56:09 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from '../components/bound-witness/xyo-zig-zag-bound-witness';
import { XyoPayload } from '../components/xyo-payload';
import { CatalogueItem } from '../network/xyo-catalogue-item';
import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoBoundWitnessTransfer } from '../components/bound-witness/xyo-bound-witness-transfer';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XYO_TCP_CATALOGUE_LENGTH_IN_BYTES, XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES } from '../network/tcp-network/xyo-tcp-network-constants';
import { XyoError } from '../components/xyo-error';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoBase } from '../components/xyo-base';

/**
 * An `XyoBoundWitnessClientInteraction` manages a "session"
 * between two networked nodes.
 */

export class XyoBoundWitnessClientInteraction extends XyoBase {

  /**
   * Creates a new instance of a `XyoBoundWitnessClientInteraction`
   * @param xyoPacker A packer for serializing and deserializing values
   * @param networkPipe A pipe to communicate with a peers
   * @param signers The signers to use for the bound witness
   * @param payload The payload to embed in the bound witness
   */

  constructor (
    private readonly xyoPacker: XyoPacker,
    private readonly networkPipe: XyoNetworkPipe,
    private readonly signers: XyoSigner[],
    private readonly payload: XyoPayload
  ) {
    super();
  }

  /**
   * Does a bound witness with another node
   */
  public async run(): Promise<XyoBoundWitness> {
    let disconnected = false;

    return new Promise(async (resolve, reject) => {
      /**
       * Listener for if and when the peer disconnects
       */
      const unregister = this.networkPipe.onPeerDisconnect(() => {
        disconnected = true;
        this.logInfo(`Peer disconnected in xyo-bound-witness-interaction`);
      });

      this.logInfo(`Starting bound witness`);

      if (!disconnected) {
        // Create the bound witness
        const boundWitness = await this.startBoundWitness();
        if (!disconnected) {
          /** Do step 1 of the bound witness */
          const boundWitnessTransferSerializer = this.xyoPacker.getSerializerByName(XyoBoundWitnessTransfer.name);
          const boundWitnessTransfer1 = boundWitnessTransferSerializer.deserialize(
            this.networkPipe.initiationData!, this.xyoPacker
          );

          const boundWitnessTransfer2 = await boundWitness.incomingData(boundWitnessTransfer1, true);

          /** Serialize the transfer value */
          const bytes = this.xyoPacker.serialize(
            boundWitnessTransfer2,
            boundWitnessTransfer2.major,
            boundWitnessTransfer2.minor,
            false
          );

          if (!disconnected) {
            /* Send the message and wait for reply */
            const response = await this.networkPipe.send(bytes);

            /** Deserialize bytes into bound witness  */
            const transferObj = boundWitnessTransferSerializer.deserialize(response!, this.xyoPacker);

            /** Add transfer to bound witness */
            await boundWitness.incomingData(transferObj, false);

            /** Stop listening for disconnect events */
            unregister();

            /** Close the connection */
            await this.networkPipe.close();

            /** Return the resulting bound-witness */
            return resolve(boundWitness);
          }
        }
      }

      return reject(
        new XyoError(`Peer disconnected in xyo-bound-witness-interaction`, XyoError.errorType.ERR_CRITICAL)
      );
    }) as Promise<XyoBoundWitness>;
  }

  private async startBoundWitness(): Promise<XyoZigZagBoundWitness> {
    const boundWitness = new XyoZigZagBoundWitness(this.xyoPacker, this.signers, this.payload);
    return boundWitness;
  }
}