const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route   GET api/profile/me 
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
        if(!profile) {
            return res.status(400).json({ msg: 'There is no proile for this user'})
        }
        res.json(profile)
    } catch(err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});

// @route   POST api/profile 
// @desc    Create or update user profile
// @access  Private
router.post('/', [auth,[
     check('status', "Status is required")
     .not()
     .isEmpty(),
     check('skills', 'Skills is required')
     .not()
     .isEmpty()
    ] ], async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()})
        }
    
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body

    // Build profile object
    const profileFileds = {}
    profileFileds.user = req.user.id
    if(company) profileFileds.company = company
    if(website) profileFileds.website = website
    if(location) profileFileds.location = location
    if(bio) profileFileds.bio = bio
    if(status) profileFileds.status = status
    if(githubusername) profileFileds.githubusername = githubusername
    if(skills) {
        profileFileds.skills = skills.split(',').map(skill => skill.trim())
    }
    // Buil social object
    profileFileds.social = {}
    if(youtube) profileFileds.social.youtube = youtube
    if(facebook) profileFileds.social.facebook = facebook
    if(twitter) profileFileds.social.twitter = twitter
    if(instagram) profileFileds.social.instagram = instagram
    if(linkedin) profileFileds.social.linkedin = linkedin

    try {
        let profile = await Profile.findOne({user: req.user.id })
        if(profile) {
            // Update
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFileds }, { new: true })
            return res.json(profile)
        }

        //Create 
        profile = new Profile(profileFileds)
        await profile.save()
        res.json(profile)

    } catch(err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router;