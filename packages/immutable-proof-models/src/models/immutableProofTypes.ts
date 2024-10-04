// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The types of immutable proof data.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ImmutableProofTypes = {
	/**
	 * The context root for the immutable proof types.
	 */
	ContextRoot: "https://schema.twindev.org/immutable-proof/",

	/**
	 * Represents Immutable Proof.
	 */
	ImmutableProof: "ImmutableProof"
} as const;

/**
 * The types of immutable proof data.
 */
export type ImmutableProofTypes = (typeof ImmutableProofTypes)[keyof typeof ImmutableProofTypes];
