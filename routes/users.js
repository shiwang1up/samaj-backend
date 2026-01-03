const express = require("express");
const { getUserController, updateUserController, followUserController, unfollowUserController, blockUserController, unblockUserController, getBlockedUserController, deleteUserController } = require("../controllers/userController");

const router = express.Router();



// GET USER
router.get("/:userId", getUserController)

// UPDATE USER
router.put("/update/:userId", updateUserController)

// FOLLOW USER
router.post("/follow/:userId", followUserController)

// UNFOLLOW USER
router.post("/unfollow/:userId", unfollowUserController)

// BLOCK USER
router.post("/block/:userId", blockUserController)

// UNBLOCK USER
router.post("/unblock/:userId", unblockUserController)

// GET BLOCKED USER
router.get("/blocked/:userId", getBlockedUserController)

// DELETE USER
router.delete("/delete/:userId", deleteUserController)

module.exports = router;