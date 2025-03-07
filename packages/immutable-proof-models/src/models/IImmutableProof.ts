// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement, IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { IDataIntegrityProof } from "@twin.org/standards-w3c-did";
import type { ImmutableProofContexts } from "./immutableProofContexts";
import type { ImmutableProofTypes } from "./immutableProofTypes";

/**
 * Interface describing an immutable proof state.
 */
export interface IImmutableProof {
	/**
	 * JSON-LD Context.
	 */
	"@context": [
		typeof ImmutableProofContexts.ContextRoot,
		typeof ImmutableProofContexts.ContextRootCommon,
		...IJsonLdContextDefinitionElement[]
	];

	/**
	 * JSON-LD Type.
	 */
	type: typeof ImmutableProofTypes.ImmutableProof;

	/**
	 * The id of the proof.
	 */
	id: string;

	/**
	 * The id of the node who created the proof.
	 */
	nodeIdentity: string;

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
	proof?: IDataIntegrityProof;

	/**
	 * The immutable receipt detail for where the proof is stored.
	 */
	immutableReceipt?: IJsonLdNodeObject;
}
