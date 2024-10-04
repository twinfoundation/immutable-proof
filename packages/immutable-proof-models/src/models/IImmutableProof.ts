// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDidProof } from "@twin.org/standards-w3c-did";
import type { ImmutableProofTypes } from "./immutableProofTypes";

/**
 * Interface describing an immutable proof state.
 */
export interface IImmutableProof {
	/**
	 * JSON-LD Context.
	 */
	"@context":
		| typeof ImmutableProofTypes.ContextRoot
		| [typeof ImmutableProofTypes.ContextRoot, ...string[]];

	/**
	 * JSON-LD Type.
	 */
	type: typeof ImmutableProofTypes.ImmutableProof;

	/**
	 * The id of the proof.
	 */
	id: string;

	/**
	 * The id of the user who created the proof.
	 */
	userIdentity: string;

	/**
	 * The id of the object associated with the proof.
	 */
	proofObjectId?: string;

	/**
	 * The hash of the object associated with the proof.
	 */
	proofObjectHash: string;

	/**
	 * The proof which can be undefined if it has not yet been issued.
	 */
	proof?: IDidProof;
}
