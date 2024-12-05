// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Guards, Is } from "@twin.org/core";
import { EngineCore } from "@twin.org/engine-core";
import type { IEngineCore, IEngineCoreClone } from "@twin.org/engine-models";
import { IdentityConnectorFactory } from "@twin.org/identity-models";
import { nameof } from "@twin.org/nameof";
import type { IImmutableProofTaskPayload } from "./models/IImmutableProofTaskPayload";
import type { IImmutableProofTaskResult } from "./models/IImmutableProofTaskResult";

const CLASS_NAME = "ImmutableProofTask";

/**
 * Process a proof.
 * @param engineCloneData The engine clone data.
 * @param payload The payload to process.
 * @returns The proof.
 */
export async function processProofTask(
	engineCloneData: IEngineCoreClone,
	payload: IImmutableProofTaskPayload
): Promise<IImmutableProofTaskResult> {
	Guards.objectValue(CLASS_NAME, nameof(engineCloneData), engineCloneData);
	Guards.objectValue(CLASS_NAME, nameof(payload), payload);
	Guards.stringValue(CLASS_NAME, nameof(payload.nodeIdentity), payload.nodeIdentity);
	Guards.stringValue(
		CLASS_NAME,
		nameof(payload.identityConnectorType),
		payload.identityConnectorType
	);
	Guards.stringHex(CLASS_NAME, nameof(payload.hashData), payload.hashData);
	Guards.stringValue(CLASS_NAME, nameof(payload.assertionMethodId), payload.assertionMethodId);

	let engine: IEngineCore | undefined;
	try {
		engine = new EngineCore();
		engine.populateClone(engineCloneData, true);
		await engine.start();

		const identityConnector = IdentityConnectorFactory.get(payload.identityConnectorType);

		const proof = await identityConnector.createProof(
			payload.nodeIdentity,
			`${payload.nodeIdentity}#${payload.assertionMethodId}`,
			Converter.hexToBytes(payload.hashData)
		);

		return {
			proofId: payload.proofId,
			proof
		};
	} finally {
		if (!Is.empty(engine)) {
			await engine.stop();
		}
	}
}
