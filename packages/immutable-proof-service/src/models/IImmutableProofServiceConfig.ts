// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the immutable proof service.
 */
export interface IImmutableProofServiceConfig {
	/**
	 * The assertion method id to use for the stream.
	 * @default immutable-proof-assertion
	 */
	assertionMethodId?: string;

	/**
	 * The key to use in the proof hash.
	 * @default immutable-proof-hash
	 */
	proofHashKeyId?: string;
}
