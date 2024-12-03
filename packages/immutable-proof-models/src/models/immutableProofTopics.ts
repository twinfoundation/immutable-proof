// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The topics for immutable proof event bus notifications.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ImmutableProofTopics = {
	/**
	 * A proof was created.
	 */
	ProofCreated: "immutable-proof:proof-created"
} as const;

/**
 * The topics for immutable proof event bus notifications.
 */
export type ImmutableProofTopics = (typeof ImmutableProofTopics)[keyof typeof ImmutableProofTopics];
