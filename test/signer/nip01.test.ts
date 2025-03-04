import {describe, expect, it} from "vitest"
import {Nip01Signer} from "../../src/signer/signers/nip01.js"
import {testSigner} from "./common.js"

describe("Nip01Signer", () => {
  testSigner("Nip01Signer", () => Nip01Signer.fromSecret("ee".repeat(32)))

  // Additional NIP-01 specific tests
  it("should create ephemeral signer", () => {
    const signer = Nip01Signer.ephemeral()
    expect(signer).toBeInstanceOf(Nip01Signer)
  })
})
