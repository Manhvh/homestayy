import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    parseCloudinaryConfig,
    isCloudinaryConfigured,
    extractCloudinaryPublicId,
} from "../configs/cloudinary.js";

describe("Cloudinary Config & Public ID Extraction", () => {
    it("parses valid CLOUDINARY_URL correctly", () => {
        const cfg = parseCloudinaryConfig({
            CLOUDINARY_URL: "cloudinary://617187191433348:realSecretKey123@uy7pfup1",
        });
        assert.equal(cfg.configured, true);
        assert.equal(cfg.cloudName, "uy7pfup1");
        assert.equal(cfg.apiKey, "617187191433348");
        assert.equal(cfg.apiSecret, "realSecretKey123");
    });

    it("prefers real credentials from CLOUDINARY_URL even if CLOUDINARY_API_SECRET has placeholder", () => {
        const cfg = parseCloudinaryConfig({
            CLOUDINARY_URL: "cloudinary://617187191433348:realSecretKey123@uy7pfup1",
            CLOUDINARY_API_SECRET: "**********",
        });
        assert.equal(cfg.configured, true);
        assert.equal(cfg.apiSecret, "realSecretKey123");
    });

    it("detects masked/placeholder secrets (**********) as not configured to safely fallback", () => {
        const masked = parseCloudinaryConfig({
            CLOUDINARY_URL: "cloudinary://617187191433348:**********@uy7pfup1",
        });
        assert.equal(masked.configured, false);
        assert.equal(isCloudinaryConfigured({ CLOUDINARY_API_SECRET: "**********" }), false);

        const template = parseCloudinaryConfig({
            CLOUDINARY_CLOUD_NAME: "uy7pfup1",
            CLOUDINARY_API_KEY: "617187191433348",
            CLOUDINARY_API_SECRET: "your_api_secret",
        });
        assert.equal(template.configured, false);
    });

    it("extracts public_id cleanly from Cloudinary URLs and ignores non-Cloudinary URLs", () => {
        assert.equal(
            extractCloudinaryPublicId(
                "https://res.cloudinary.com/uy7pfup1/image/upload/v1730000000/homestay/rooms/abc_123.webp"
            ),
            "homestay/rooms/abc_123"
        );
        assert.equal(
            extractCloudinaryPublicId(
                "https://res.cloudinary.com/uy7pfup1/image/upload/q_auto,f_auto/v1730000000/homestay/hotels/cover.jpg"
            ),
            "homestay/hotels/cover"
        );
        assert.equal(
            extractCloudinaryPublicId("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"),
            null
        );
        assert.equal(
            extractCloudinaryPublicId("http://localhost:4000/uploads/12345.webp"),
            null
        );
    });
});
