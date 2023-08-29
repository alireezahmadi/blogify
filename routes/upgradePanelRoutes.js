import express from 'express' 
import UpgradePanelController from '../controllers/upgradePanel/upgradePanelController.js'
import upgradePanelValidator from '../validators/upgradePanelValidator.js'

const router = express.Router() 

router.get('/create', UpgradePanelController.create)
router.post('/create', upgradePanelValidator(), UpgradePanelController.create)

export default router