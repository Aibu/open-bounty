'use strict';

const router = require('express').Router();
const Bounty = require('../../../db/models/bounty');
const Project = require('../../../db/models/project');
const User = require('../../../db/models/user');
module.exports = router;

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.status(401).end()
    }
}

router.post('/', (req, res, next) => {
    // Project.findById(req.body.projectId)
    //     .then(project => {
    //         return project.update({
    //             fundsOnHold: project.fundsOnHold + Number(req.body.amount)
    //         })
    //     })
    //     .then(() => {
    //         Bounty.create(req.body)
    //             .then(bounty => {
    //                 res.status(201).send(bounty)
    //             })
    //     })
    //     .catch(next);
    console.log('req.body:', req.body);
    let projectName;
    const updatingProject = Project.findById(req.body.projectId)
        .then(project => {
            projectName = project.name;
            return project.update({
                fundsOnHold: project.fundsOnHold + Number(req.body.amount)
            })
        })
          .then(() => {
	      return req.github.issues.addLabels({
		  user: req.user.githubName,
		  repo: projectName,
		  number: req.body.issueNumber,
		  body: ['OpenBounty']
	      })
	  });

    const creatingBounty = Bounty.create(req.body);
   
    Promise.all([updatingProject, creatingBounty])
	.then(([project, bounty]) => {
	    console.log('project:', project);
	    res.status(201).send(bounty);
	})
	.catch(next);
});

router.get('/tracked', (req, res, next) => {
    req.user.getBounties()
        .then(userBounties => res.send(userBounties))
        .catch(next);
});

router.param('bountyId', (req, res, next, bountyId) => {
    Bounty.findById(bountyId)
        .then(bounty => {
            req.bounty = bounty;
            next();
        })
        .catch(next);
});

router.get('/:bountyId', (req, res, next) => {
    req.bounty.getProject()
        .then(project => {
            return bounty.attachIssue(req.github, req.user.githubName, project.name);
        })
        .then(bountyWithIssue => {
            res.send(bountyWithIssue);
        })
        .catch(next);
});

router.get('/:bountyId/track', (req, res, next) => {
    req.user.addBounty(req.bounty.id)
        .then(_ => req.bounty.addHunter(req.user.id))
        .then(_ => res.sendStatus(204))
        .catch(next);
});

router.get('/:bountyId/untrack', (req, res, next) => {
    req.user.removeBounty(req.bounty.id)
        .then(_ => req.bounty.removeHunter(req.user.id))
        .then(_ => res.sendStatus(204))
        .catch(next);
});

router.put('/:bountyId', (req, res, next) => {
    req.bounty.updateAmount(req.body.amount)
        .then(updatedBounty => {
            res.send(updatedBounty);
        })
        .catch(next);
});

router.delete('/:bountyId', (req, res, next) => {
    req.bounty.updateAmount(0)
        .then(() => {
            return req.bounty.destroy()
                .then(() => {
                    res.sendStatus(204)
                })
        })
        .catch(next);
});
