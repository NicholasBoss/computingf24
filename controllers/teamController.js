const teamController = {}

teamController.buildWdd = async function(req, res){
    res.render('teams/wdd', {
        title: 'WDD', 
        link: 'teams/wdd', 
    })
}
teamController.builddataSciAi = async function(req, res){
    res.render('teams/dataSciAi', {
        title: 'dataSciAi', 
        link: 'teams/DataSciAi', 
    })
}
teamController.buildGamedev = async function(req, res){
    res.render('teams/gamedev', {
        title: 'Game Development', 
        link: 'teams/gamedev', 
    })
}

teamController.buildcloudsoluation = async function(req, res){
    res.render('teams/cloudsoluation', {
        title: 'CloudSoluation', 
        link: 'teams/cloudsoluation', 
    })
}

teamController.buildSWE = async function(req, res){
    res.render('teams/swe', {
        title: 'Society of Women Engineers', 
        link: 'teams/swe', 
    })
}

module.exports = teamController