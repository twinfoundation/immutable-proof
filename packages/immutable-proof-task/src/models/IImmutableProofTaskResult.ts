// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataIntegrityProof } from "@twin.org/standards-w3c-did";

/**
 * The result for the immutable proof task.
 */
export interface IImmutableProofTaskResult {
	/**
	 * The proof id.
	 */
	proofId: string;

	/**
	 * The proof.
	 */
	proof: IDataIntegrityProof;
}
