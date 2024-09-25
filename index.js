const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URLS = {
  "propertree":
    "https://discord.com/api/webhooks/1271015368122437753/TGp_DN5aGqWQL_njH2CBrX-wiafOfnTU3diyQUiSGcRYt9y94aO7Q_Pnr6UbzyZzOD5k",
  "koperasi-digital-propertree":
    "https://discord.com/api/webhooks/1271015710629560401/jzzK_USl2Np4X4MuX0rbeNFVXtRdbHBycUdbjYednL3r5q4mzLmKyMSRwUfI62fs_fgi",
  gethome:
    "https://discord.com/api/webhooks/1270989810177146961/OixIf8TriPVfBbrVNIttlEoGIL0tECrQYARWIGWHLkuw0EypXKELCs8nG3oVJt5LWpIU",
  rilex:
    "https://discord.com/api/webhooks/1271016004687892597/NJi8Zd5jQmIcQtiWd6uEx87AN2IUNRClykkSMvJHAKX-3O-WGw7vH618zRR6AyjMwgsJ",
  agrio:
    "https://discord.com/api/webhooks/1271016133201362954/mmuqFIcZl9kki7dJPzfmlkysv1evkkGqnBnbu2ITP9RVqIDdK-uDVR5n_cG3lvue2KLU",
  roastkuy:
    "https://discord.com/api/webhooks/1271016278747906141/9G1tkbTogLaz0fe1hpn2i6wyW0r-d7M-nkfsR98zcglRXfVTK9UvnwF4tmELna7pn6Yr",
  "propertree-club":
    "https://discord.com/api/webhooks/1272463766738571298/CgH93lL7o7YYvGjHKztiuHDF2gaeDRIBD67fm1EdWC5CO7jhDuqXfVnnSFnLDLiKra3J",
};

app.use(bodyParser.json());

function handleWebhook(req, res, projectName) {
  const event = req.headers["x-event-key"];
  const body = req.body;
  const webhookUrl = WEBHOOK_URLS[projectName];

  let embed = {};

  switch (event) {
    case "repo:push":
      const repositoryName = body.repository.name;
      const branchName = body.push.changes[0].new.name;
      const userName = body.actor.display_name;
      const commits = body.push.changes[0].commits
        .map((commit) => {
          const commitUrl = commit.links.html.href;
          const commitMessage = commit.message.trim(); // Trim to avoid extra spaces/newlines
          return `- ${commitMessage}`;
        })
        .join("\n");

      embed = {
        title: "➡️ Changes Pushed",
        description: `Changes were pushed to the branch by **${userName}**`,
        fields: [
          {
            name: "Repository",
            value: repositoryName,
            inline: true,
          },
          {
            name: "Branch",
            value: branchName,
            inline: true,
          },
          {
            name: "Last Commits",
            value: commits || "No commits",
            inline: false,
          },
        ],
        color: 0x38bdf8, // Optional: color of the embed
        timestamp: new Date(),
      };
      break;
    case "pullrequest:created":
      const prTitle = body.pullrequest.title;
      const prDescription =
        body.pullrequest.description || "No description provided";
      const prSourceBranch = body.pullrequest.source.branch.name;
      const prDestinationBranch = body.pullrequest.destination.branch.name;
      const prAuthor = body.actor.display_name;
      const prRepository = body.repository.name;

      embed = {
        title: "🅿️ New Pull Request",
        description: `New pull request by **${prAuthor}** in **${prRepository}**`,
        fields: [
          {
            name: "Title",
            value: prTitle,
            inline: false,
          },
          {
            name: "Description",
            value: prDescription,
            inline: false,
          },
          {
            name: "Source Branch",
            value: prSourceBranch,
            inline: true,
          },
          {
            name: "Destination Branch",
            value: prDestinationBranch,
            inline: true,
          },
        ],
        color: 0x38bdf8, // Hex color code converted to decimal
        timestamp: new Date(),
      };
      break;
    case "pullrequest:approved":
      const prApprovedBy = body.actor.display_name;
      const prApprovedTitle = body.pullrequest.title;
      const prApprovedSourceBranch = body.pullrequest.source.branch.name;
      const prApprovedDestinationBranch =
        body.pullrequest.destination.branch.name;
      const prApprovedRepository = body.repository.name;

      embed = {
        title: "🅿️ ✅ Pull Request Approved",
        description: `Pull request approved by **${prApprovedBy}**`,
        fields: [
          {
            name: "PR",
            value: `${prApprovedSourceBranch}`,
            inline: true,
          },
          {
            name: "Repository",
            value: prApprovedRepository,
            inline: true,
          },
          {
            name: "Destination",
            value: `${prApprovedSourceBranch} => ${prApprovedDestinationBranch}`,
            inline: true,
          },
        ],
        color: 0x34d399, // Hex color code converted to decimal
        timestamp: new Date(),
      };
      break;

    case "pullrequest:unapproved":
      const prUnapprovedBy = body.actor.display_name;
      const prUnapprovedTitle = body.pullrequest.title;
      const prUnapprovedSourceBranch = body.pullrequest.source.branch.name;
      const prUnapprovedDestinationBranch =
        body.pullrequest.destination.branch.name;
      const prUnapprovedRepository = body.repository.name;

      embed = {
        title: "🅿️ ❌ Pull Request Unapproved",
        description: `Pull request unapproved by **${prUnapprovedBy}**`,
        fields: [
          {
            name: "PR",
            value: `${prUnapprovedSourceBranch}`,
            inline: true,
          },
          {
            name: "Repository",
            value: prUnapprovedRepository,
            inline: true,
          },
          {
            name: "Destination",
            value: `${prUnapprovedSourceBranch} => ${prUnapprovedDestinationBranch}`,
            inline: true,
          },
        ],
        color: 15158332, // Hex color code converted to decimal
        timestamp: new Date(),
      };
      break;

    case "pullrequest:updated":
      const prUpdatedBy = body.actor.display_name;
      const prUpdatedTitle = body.pullrequest.title;
      const prUpdatedDescription =
        body.pullrequest.description || "No description provided";
      const prUpdatedSourceBranch = body.pullrequest.source.branch.name;
      const prUpdatedDestinationBranch =
        body.pullrequest.destination.branch.name;
      const prUpdatedRepository = body.repository.name;

      embed = {
        title: "🅿️ 🔄 Pull Request Updated",
        description: `Pull request updated by **${prUpdatedBy}**`,
        fields: [
          {
            name: "Title",
            value: prUpdatedTitle,
            inline: false,
          },
          {
            name: "Description",
            value: prUpdatedDescription,
            inline: false,
          },
          {
            name: "Source Branch",
            value: prUpdatedSourceBranch,
            inline: true,
          },
          {
            name: "Destination Branch",
            value: prUpdatedDestinationBranch,
            inline: true,
          },
        ],
        color: 0x38bdf8, // Hex color code converted to decimal
        timestamp: new Date(),
      };
      break;

    case "pullrequest:comment_created":
      const prCommentAuthor = body.actor.display_name;
      const prCommentText =
        body.comment.content.raw || "No comment text available";
      const prCommentTitle = body.pullrequest.title;
      const prCommentSourceBranch = body.pullrequest.source.branch.name;
      const prCommentDestinationBranch =
        body.pullrequest.destination.branch.name;
      const prCommentRepository = body.repository.name;

      embed = {
        title: "💬 Pull Request Comment Created",
        description: `Comment created by **${prCommentAuthor}**`,
        fields: [
          {
            name: "PR Title",
            value: prCommentTitle,
            inline: false,
          },
          {
            name: "Comment",
            value: prCommentText,
            inline: false,
          },
          {
            name: "Source Branch",
            value: prCommentSourceBranch,
            inline: true,
          },
          {
            name: "Destination Branch",
            value: prCommentDestinationBranch,
            inline: true,
          },
        ],
        color: 0x38bdf8, // Hex color code converted to decimal
        timestamp: new Date(),
      };
      break;
    case "pullrequest:rejected":
      const prRejectedBy = body.actor.display_name;
      const prRejectedTitle = body.pullrequest.title;
      const prRejectedDescription =
        body.pullrequest.description || "No description provided";
      const prRejectedSourceBranch = body.pullrequest.source.branch.name;
      const prRejectedDestinationBranch =
        body.pullrequest.destination.branch.name;
      const prRejectedRepository = body.repository.name;
      const prRejectionComment =
        body.pullrequest.rendered.reason.raw || "No comment provided"; // Check if body.comment exists

      embed = {
        title: "🅿️ ❌ Pull Request Rejected",
        description: `Pull request rejected by **${prRejectedBy}**`,
        fields: [
          {
            name: "Title",
            value: prRejectedTitle,
            inline: false,
          },
          {
            name: "Description",
            value: prRejectedDescription,
            inline: false,
          },
          {
            name: "Source Branch",
            value: prRejectedSourceBranch,
            inline: true,
          },
          {
            name: "Destination Branch",
            value: prRejectedDestinationBranch,
            inline: true,
          },
          {
            name: "Rejection Comment",
            value: prRejectionComment,
            inline: false,
          },
        ],
        color: 15158332, // Hex color code converted to decimal
        timestamp: new Date(),
      };
      break;
    case "pullrequest:fulfilled":
      const prMergedBy = body.actor.display_name;
      const prMergedTitle = body.pullrequest.title;
      const prMergedRepository = body.repository.name;
      const prMergedSourceBranch = body.pullrequest.source.branch.name;
      const prMergedDestinationBranch =
        body.pullrequest.destination.branch.name;

      embed = {
        title: "🅿️ 🎉 Pull Request Merged",
        description: `Pull request merged by **${prMergedBy}**`,
        fields: [
          {
            name: "PR Title",
            value: prMergedTitle,
            inline: false,
          },
          {
            name: "Repository",
            value: prMergedRepository,
            inline: false,
          },
          {
            name: "Source Branch",
            value: prMergedSourceBranch,
            inline: true,
          },
          {
            name: "Destination Branch",
            value: prMergedDestinationBranch,
            inline: true,
          },
        ],
        color: 0x34d399, // Hex color code converted to decimal
        timestamp: new Date(),
      };
      break;
    case "repo:commit_status_created":
      const createdPipelineId = body.commit_status.key;
      const createdPipelineName = body.commit_status.name;
      const createdRepositoryName = body.repository.name;
      const createdCommitHash = body.commit_status.commit.hash;
      const createdCommitMessage = body.commit_status.commit.message.trim();
      const createdStatus = body.commit_status.state;
      const createdCommitUrl = body.commit_status.commit.links.html.href;
      const createdPipelineUrl = body.commit_status.url;

      const createdEmbedTitle = "🚧 Build in Progress";
      const createdEmbedColor = 0xffa500; // Orange for in-progress

      embed = {
        title: createdEmbedTitle,
        description: `Pipeline: [Pipeline #${createdPipelineId}](${createdPipelineUrl}) for ${createdRepositoryName}`,
        fields: [
          {
            name: "Repository",
            value: createdRepositoryName,
            inline: true,
          },
          {
            name: "Pipeline",
            value: createdPipelineName,
            inline: true,
          },
          {
            name: "Commit",
            value: `[${createdCommitHash.substring(
              0,
              7
            )}](${createdCommitUrl}) - ${createdCommitMessage}`,
            inline: false,
          },
          {
            name: "Status",
            value: createdStatus,
            inline: false,
          },
        ],
        color: createdEmbedColor, // Set the color for in-progress
        timestamp: new Date(),
      };
      break;

    case "repo:commit_status_updated":
      const updatedPipelineId = body.commit_status.key;
      const updatedPipelineName = body.commit_status.name;
      const updatedRepositoryName = body.repository.name;
      const updatedCommitHash = body.commit_status.commit.hash;
      const updatedCommitMessage = body.commit_status.commit.message.trim();
      const updatedStatus = body.commit_status.state;
      const updatedCommitUrl = body.commit_status.commit.links.html.href;
      const updatedPipelineUrl = body.commit_status.url;

      let updatedEmbedTitle;
      let updatedEmbedColor;

      switch (updatedStatus) {
        case "SUCCESSFUL":
          updatedEmbedTitle = "✅ Build Successful";
          updatedEmbedColor = 0x34d399; // Green for success
          break;
        case "FAILED":
          updatedEmbedTitle = "⛔ Build Failed";
          updatedEmbedColor = 15158332; // Red for failure
          break;
        default:
          updatedEmbedTitle = "🔄 Build Status Updated";
          updatedEmbedColor = 0x38bdf8; // Orange for other statuses
          break;
      }

      embed = {
        title: updatedEmbedTitle,
        description: `Pipeline: [Pipeline #${updatedPipelineId}](${updatedPipelineUrl}) for ${updatedRepositoryName}`,
        fields: [
          {
            name: "Repository",
            value: updatedRepositoryName,
            inline: true,
          },
          {
            name: "Pipeline",
            value: updatedPipelineName,
            inline: true,
          },
          {
            name: "Commit",
            value: `[${updatedCommitHash.substring(
              0,
              7
            )}](${updatedCommitUrl}) - ${updatedCommitMessage}`,
            inline: false,
          },
          {
            name: "Status",
            value: updatedStatus,
            inline: false,
          },
        ],
        color: updatedEmbedColor, // Set the color based on the status
        timestamp: new Date(),
      };
      break;
    // Add more event cases as needed
    default:
      embed = {
        title: "Unhandled Event",
        description: `Unhandled event: ${event}`,
        color: 15158332, // Optional: color of the embed
        timestamp: new Date(),
      };
  }

  if (embed) {
    axios
      .post(webhookUrl, {
        embeds: [embed],
      })
      .then(() => {
        res.status(200).send("Event received and message sent to Discord.");
      })
      .catch((error) => {
        console.error("Error sending message to Discord:", error);
        res.status(500).send("Error sending message to Discord.");
      });
  } else {
    res.status(400).send("No message to send.");
  }
}

app.post("/propertree", (req, res) => {
  handleWebhook(req, res, "propertree");
});

// Route for koperasi-digital-propertree
app.post("/koperasi-digital-propertree", (req, res) => {
  handleWebhook(req, res, "koperasi-digital-propertree");
});

// Route for gethome
app.post("/gethome", (req, res) => {
  handleWebhook(req, res, "gethome");
});

// Route for rilex
app.post("/rilex", (req, res) => {
  handleWebhook(req, res, "rilex");
});

// Route for agrio
app.post("/agrio", (req, res) => {
  handleWebhook(req, res, "agrio");
});

// Route for roastkuy
app.post("/roastkuy", (req, res) => {
  handleWebhook(req, res, "roastkuy");
});

app.post("/propertree-club", (req, res) => {
  handleWebhook(req, res, "propertree-club");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
