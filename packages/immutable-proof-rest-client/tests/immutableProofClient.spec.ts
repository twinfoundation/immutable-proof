// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ImmutableProofClient } from "../src/immutableProofClient";

describe("ImmutableProofClient", () => {
	test("Can create an instance", async () => {
		const client = new ImmutableProofClient({ endpoint: "http://localhost:8080" });
		expect(client).toBeDefined();
	});
});
