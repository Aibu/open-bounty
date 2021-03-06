'use strict';

app.factory('DonationFactory', ($http, $log) => {
    const DonationFactory = {};
    const getData = data => data.data;

    DonationFactory.requestPayPalToken = (project, form) => {
        let data = {
            description: `Your donation for ${project.name}!`,
            amount: form.donationAmount.$viewValue,
            paypalEmail: form.paypalEmail.$viewValue,
            donorName: form.donorName.$viewValue,
            donationAnonymous: form.donationAnonymous.$viewValue,
            projectId: project.id
        }
        return $http.post('/api/donations/collect', data)
            .then(getData)
            .catch($log.error);
    }

    DonationFactory.getDonationHistory = (projectId) => {
        return $http.get('/api/donations/history/' + projectId)
            .then(getData)
            .catch($log.error);
    }

    DonationFactory.getPaidHistory = (projectId) => {
        return $http.get('/api/donations/history/paid/' + projectId)
            .then(getData)
            .catch($log.error);
    }

    return DonationFactory;

});
