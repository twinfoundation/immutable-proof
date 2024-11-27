// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/**
 * The payload for the immutable proof task.
 */
export interface IImmutableProofTaskPayload {
	/**
	 * The proof id.
	 */
	proofId: string;

	/**
	 * The node identity.
	 */
	nodeIdentity: string;

	/**
	 * The identity connector type.
	 */
	identityConnectorType: string;

	/**
	 * The assertion method id.
	 */
	assertionMethodId: string;

	/**
	 * The hash data.
	 */
	hashData: string;
}
