const teamController = {}

teamController.buildWdd = async function(req, res){
    res.render('teams/wdd', {
        title: 'WDD', 
        link: 'teams/wdd', 
    })
}

// teamController.buildAbout = async function(req, res){
//     res.render('about/about', {
//         title: 'About Us', 
//         link: 'about', 
//         errors: null
//     })
// }

module.exports = teamController