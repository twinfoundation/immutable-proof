// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the immutable proof service.
 */
export interface IImmutableProofServiceConfig {
	/**
	 * The verification method id to use for the proof.
	 * @default immutable-proof-assertion
	 */
	verificationMethodId?: string;
}
