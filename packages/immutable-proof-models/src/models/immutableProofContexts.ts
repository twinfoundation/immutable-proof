// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The contexts of immutable proof data.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ImmutableProofContexts = {
	/**
	 * The context root for the immutable proof types.
	 */
	ContextRoot: "https://schema.twindev.org/immutable-proof/",

	/**
	 * The context root for the common types.
	 */
	ContextRootCommon: "https://schema.twindev.org/common/"
} as const;

/**
 * The contexts of immutable proof data.
 */
export type ImmutableProofContexts =
	(typeof ImmutableProofContexts)[keyof typeof ImmutableProofContexts];
