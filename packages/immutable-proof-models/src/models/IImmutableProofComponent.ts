// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { IImmutableProof } from "./IImmutableProof";
import type { IImmutableProofVerification } from "./IImmutableProofVerification";

/**
 * Interface describing an immutable proof contract.
 */
export interface IImmutableProofComponent extends IComponent {
	/**
	 * Create a new proof.
	 * @param document The document to create the proof for.
	 * @param userIdentity The identity to create the immutable proof operation with.
	 * @param nodeIdentity The node identity to use for vault operations.
	 * @returns The id of the new proof.
	 */
	create(
		document: IJsonLdNodeObject,
		userIdentity?: string,
		nodeIdentity?: string
	): Promise<string>;

	/**
	 * Get a proof.
	 * @param id The id of the proof to get.
	 * @returns The proof.
	 * @throws NotFoundError if the proof is not found.
	 */
	get(id: string): Promise<IImmutableProof>;

	/**
	 * Verify a proof.
	 * @param id The id of the proof to verify.
	 * @returns The result of the verification and any failures.
	 * @throws NotFoundError if the proof is not found.
	 */
	verify(id: string): Promise<IImmutableProofVerification>;

	/**
	 * Remove the immutable storage for the proof.
	 * @param id The id of the proof to remove the storage from.
	 * @param nodeIdentity The node identity to use for vault operations.
	 * @returns Nothing.
	 * @throws NotFoundError if the proof is not found.
	 */
	removeImmutable(id: string, nodeIdentity?: string): Promise<void>;
}
