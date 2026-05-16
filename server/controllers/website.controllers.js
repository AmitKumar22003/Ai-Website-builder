import { generateResponse } from "../config/openRouter.js";
import Website from "../models/website.model.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
THIS WEBSITE MUST BE FULLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔ Mobile-first CSS approach
✔ Responsive layout for:
  - Mobile (<768px)
  - Tablet (768px–1024px)
  - Desktop (>1024px)

✔ Use:
  - CSS Grid / Flexbox
  - Relative units (%, rem, vw)
  - Media queries

✔ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stacks on mobile
  - Sections stack vertically on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - No horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE → RESPONSE IS INVALID.

--------------------------------------------------
IMAGES (MANDATORY & RESPONSIVE)
--------------------------------------------------
- Use high-quality images ONLY from:
  https://images.unsplash.com/

- EVERY image URL MUST include:
  ?auto=format&fit=crop&w=1200&q=80

--------------------------------------------------
TECHNICAL RULES
--------------------------------------------------
- Output ONE single HTML file
- Exactly ONE <style> tag
- Exactly ONE <script> tag
- NO external CSS / JS / fonts
- Use system fonts only
- iframe srcdoc compatible
- Create SPA behavior using JS
- No page reloads

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RETURN RAW JSON ONLY
- NO markdown
- NO explanations
- NO extra text
`;

export const generateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        message: "Prompt is required",
      });
    }

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "You do not have enough credits to generate a website",
      });
    }

    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt);

    let raw = "";
    let parsed = null;

    for (let i = 0; i < 2; i++) {
      raw = await generateResponse(finalPrompt);

      parsed = await extractJson(raw);

      if (parsed) break;

      raw = await generateResponse(
        finalPrompt + "\n\nRETURN ONLY VALID RAW JSON",
      );

      parsed = await extractJson(raw);

      if (parsed) break;
    }

    if (!parsed) {
      console.log("RAW AI RESPONSE:", raw);

      return res.status(400).json({
        message: "AI returned invalid JSON",
      });
    }

    if (!parsed.code) {
      console.log("INVALID AI RESPONSE:", parsed);

      return res.status(400).json({
        message: "AI returned invalid website code",
      });
    }

    const website = await Website.create({
      user: user._id,

      title: prompt.slice(0, 60),

      latestCode: parsed.code,

      conversation: [
        {
          role: "user",
          content: prompt,
        },
        {
          role: "ai",
          content: parsed.message || "Website generated successfully",
        },
      ],
    });

    user.credits -= 50;

    await user.save();

    return res.status(201).json({
      website: website._id,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.log("GENERATE WEBSITE ERROR:", error);

    return res.status(500).json({
      message: error.message || "generate website error",
    });
  }
};

export const getWebsiteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Website id is required",
      });
    }

    const website = await Website.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    return res.status(200).json(website);
  } catch (error) {
    console.log("GET WEBSITE ERROR:", error);

    return res.status(500).json({
      message: error.message || "get website by id error",
    });
  }
};

export const changes = async (req, res) => {
  try {
    const { prompt } = req.body;

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Website id is required",
      });
    }

    if (!prompt) {
      return res.status(400).json({
        message: "Prompt is required",
      });
    }

    const website = await Website.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.credits < 25) {
      return res.status(400).json({
        message: "You do not have enough credits to update website",
      });
    }

    const updatePrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

RETURN RAW JSON ONLY:
{
  "message":"Short Confirmation",
  "code":"<UPDATED FULL HTML>"
}
`;

    let raw = "";
    let parsed = null;

    for (let i = 0; i < 2; i++) {
      raw = await generateResponse(updatePrompt);

      parsed = await extractJson(raw);

      if (parsed) break;

      raw = await generateResponse(
        updatePrompt + "\n\nRETURN ONLY VALID RAW JSON",
      );

      parsed = await extractJson(raw);

      if (parsed) break;
    }

    if (!parsed) {
      console.log("RAW AI RESPONSE:", raw);

      return res.status(400).json({
        message: "AI returned invalid JSON",
      });
    }

    if (!parsed.code) {
      console.log("INVALID AI RESPONSE:", parsed);

      return res.status(400).json({
        message: "AI returned invalid website code",
      });
    }

    website.conversation.push(
      {
        role: "user",
        content: prompt,
      },
      {
        role: "ai",
        content: parsed.message || "Website updated successfully",
      },
    );

    website.latestCode = parsed.code;

    await website.save();

    user.credits -= 25;

    await user.save();

    return res.status(200).json({
      message: parsed.message,
      code: parsed.code,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.log("UPDATE WEBSITE ERROR:", error);

    return res.status(500).json({
      message: error.message || "update website error",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const websites = await Website.find({
      user: req.user._id,
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json(websites);
  } catch (error) {
    console.log("GET ALL WEBSITES ERROR:", error);

    return res.status(500).json({
      message: error.message || "get all websites error",
    });
  }
};
