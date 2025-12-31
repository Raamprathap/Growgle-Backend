const router = require('express').Router();
const { tokenValidator } = require('../middlewares/auth/tokenValidation');
const {
  createRoadmap,
  listRoadmaps,
  getRoadmap,
  updateRoadmap,
  deleteRoadmap,
} = require('../controllers/roadmap.controller');

router.post('/', tokenValidator, createRoadmap);
router.get('/', tokenValidator, listRoadmaps);
router.get('/:id', tokenValidator, getRoadmap);
router.patch('/:id', tokenValidator, updateRoadmap);
router.delete('/:id', tokenValidator, deleteRoadmap);

module.exports = router;
