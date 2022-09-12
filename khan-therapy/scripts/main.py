"""
khan_therapy.py

Project: Khan Therapy
"""

import qi
import threading
import stk.runner
import stk.events
import stk.services
import stk.logging
from functools import partial

__version__ = '0.0.4'
__copyright__ = 'Copyright 2021, DECRS'
__author__ = 'samuel'
__email__ = 'akrah001@d.umn.edu'


@qi.multiThreaded()
class KhanTherapy(object):
   

    PKG_ID = 'khan-therapy'
    APP_ID = 'com.aldebaran.{}'.format(PKG_ID)
    PKG_PATH = '/home/nao/.local/share/PackageManager/apps/{}'.format(PKG_ID)
    TOPIC_NAMES = None
    TOPIC_NAME = None
    TOPIC_PATHS = None
    SOUND_PATH = '{0}/sounds/{1}'.format(PKG_PATH, '{}')
    YIELD_KEY   = 'yield'
    STOP_SPEECH = 'stop_speech'
    CATALOG_KEY = 'KhanTherapy/Event'
    KEYWORDS_KEY = 'KhanTherapy/Residents'
    REQUEST_KEY = 'KhanTherapy/Request'
    CONFIRM_KEY = 'KhanTherapy/Confirm'
    START_KEY = 'KhanTherapy/Start'
    RESIDENT_KEY = 'KhanTherapy/Resident'
    GREETER_MODE = 'KhanTherapy/greeterMode'
    SAFETY_OFF   = 'KhanTherapy/safetyOff'
    SAFETY_ON    = 'KhanTherapy/safetyOn'

    def __init__(self, qiapp):
        self.qiapp = qiapp
        self.events = stk.events.EventHelper(qiapp.session)
        self.s = stk.services.ServiceCache(qiapp.session)
        self.logger = stk.logging.get_logger(qiapp.session, self.APP_ID)

        try:
            self.s.ALMemory.removeData('KhanTherapy/User')
        except RuntimeError:
            pass
        self.s.ALBarcodeReader.subscribe(self.PKG_ID)

        self.show_tablet()
        self.intro_music = qi.async(
            self.s.ALAudioPlayer.playFile,
            self.SOUND_PATH.format('intro_music.wav'),
            1.0, 0.0)
        self.s.ALBasicAwareness.pauseAwareness()
        self.s.ALBehaviorManager.runBehavior(
            'boston_animation_library/Stand/rm_loading')

        self.language = self.s.ALDialog.getLanguage()
        code = self.s.ALDialog.convertLongToNU(self.language)
        self.TOPIC_NAMES = ['KhanTherapy', 'BestBuy']
        self.TOPIC_NAME = 'KhanTherapy'  # later, read this from preferences (when more than BestBuy)
        self.TOPIC_PATHS = {topic: '{0}/dialog/{1}/{1}_{2}.top'.format(self.PKG_PATH, topic, '{}') for topic in self.TOPIC_NAMES}
        self.TOPIC_PATH = self.TOPIC_PATHS[self.TOPIC_NAME].format(code)
        #self.s.ALDialog.loadTopic(self.TOPIC_PATH)
        self.s.ALDialog._addDialogFromTopicBox(self.TOPIC_PATH, self.PKG_ID)
        self.s.ALSpeechRecognition.setAudioExpression(False)

        eDOFM = 'enableDeactivationOfFallManager'
        try:
            config = self.s.ALMotion._getMotionConfig('Protection')
            self.orig_safety = {x.split(':')[0].strip():
                                [float(z) for z in x.split(':')[1].strip().rstrip(',').split(',')]
                                for x in config.split('\n') if ':' in x}[eDOFM][0]
        except (KeyError, ValueError, RuntimeError):
            self.orig_safety = 0
        self.s.ALMotion.setMotionConfig(
            [['ENABLE_DEACTIVATION_OF_FALL_MANAGER', 1]])
        self.s.ALAutonomousLife.setSafeguardEnabled(
            'RobotMoved', False)

        self.catalog = []
        self.keywords = {}
        self.store_data = None
        self.store_data_fut = None

        self.speech_lock = threading.Lock()
        self.events.connect(self.YIELD_KEY, self.handle_yield)
       
        
        self.events.connect(self.STOP_SPEECH, self.stop_speech)
        self.events.connect(self.GREETER_MODE, self.start_greeter)
        self.events.connect(self.SAFETY_OFF, self.set_safety_off)
        self.events.connect(self.SAFETY_ON, self.set_safety_on)
        
        self._bind_touch_reflexes()
        self._bind_no_hand_stiff()
        self._check_daps()

    def show_tablet(self):
        self.logger.verbose('Attempting to start tablet webview')
        tablet = self.s.ALTabletService
        if tablet:
            robot_ip = tablet.robotIp()
            app_url = 'http://{}/apps/{}/'.format(robot_ip, self.PKG_ID)
            tablet.showWebview(app_url)
        else:
            self.logger.warning('Lost tablet service, cannot load ' +
                                'application: {}'.format(self.PKG_ID))

    #
    # STK.runner required functions
    #

    def on_start(self):
        """Starts everything"""
        #self.s.ALMotion.setCollisionProtectionEnabled('Arms', False)
        #self.s.ALMotion.setExternalCollisionProtectionEnabled('All', False)
        self.listen_for_commands()
        self.intro_music.addCallback(self._dialog_init)

    @qi.bind(returnType=qi.Void, paramsType=[])
    def stop(self):
        self.logger.info('Stopped by user request.')
        self.qiapp.stop()

    @qi.nobind
    def on_stop(self):
        """Cleanup"""
        self.events.disconnect('yield')
        self.s.ALMotion.setMotionConfig(
            [['ENABLE_DEACTIVATION_OF_FALL_MANAGER', self.orig_safety]])
        self.s.ALDialog.deactivateTopic(self.TOPIC_NAME)
        try:
            self.s.ALDialog.unloadTopic(self.TOPIC_NAME)
        except RuntimeError as err:
            self.logger.warning(
                'Problem unloading topic: {}'.format(err))
        try:
            self.s.ALDialog.unsubscribe(self.APP_ID)
        except RuntimeError as err:
            self.logger.warning(
                'Problem unsubscribing dialog: {}'.format(err))
        self.logger.info('Khan Therapy finished.')

    #
    # Dialog-based functionality
    #

    def listen_for_commands(self):
        """Listen for verbal commands."""
        self.s.ALDialog.activateTopic(self.TOPIC_NAME)
        self.s.ALDialog.setFocus(self.TOPIC_NAME)
        self.s.ALDialog.subscribe(self.APP_ID)

    def handle_yield(self, data):
        """Handle verbal commands."""
        splata = data.split(',')
        intention, args = splata[0], splata[1:]
        if intention == 'audio_tour':
            self.s.ALTextToSpeech.stopAll()
            self.say_tag(args[0])

    def stop_speech(self, data):
        self.s.ALTextToSpeech.stopAll()
    
    



    def say_tag(self, tag):
        self.logger.info('say_tag : %s' % tag)
        with self.speech_lock :
            try:
                self.s.ALBasicAwareness.pauseAwareness()
                self.s.ALDialog.gotoTag(tag, self.TOPIC_NAME)
            except RuntimeError:
                pass

    def ignore_commands(self):
        """Ignore verbal commands."""
        try:
            # self.s.ALTextToSpeech.stopAll()
            self.s.ALDialog.deactivateTopic(self.TOPIC_NAME)
            try:
                self.s.ALDialog.unsubscribe(self.APP_ID)
            except Exception as err:
                self.logger.warning('Problem unsubscribing: {}'.format(err))
        except Exception as err:
            self.logger.warning('Problem ignoring commands: {}'.format(err))

    def _dialog_init(self, *unused):
        self.initialize_dialog_db()

        # start breath
        self.s.ALMotion.setBreathEnabled("Arms", True)
        self.s.ALMotion.setBreathEnabled("Head", True)

        self.s.ALDialog.gotoTag('welcome', self.TOPIC_NAME)

    def initialize_dialog_db(self):
        data = self.read_store_data(10, [self.CATALOG_KEY, self.KEYWORDS_KEY])
        catalog, keywords = data[self.CATALOG_KEY], data[self.KEYWORDS_KEY]
        self._store_catalog(catalog)
        self._store_keywords(keywords)

    def read_store_data(self, timeout, keys):
        self.store_data = qi.Promise()
        self.store_data_fut = self.store_data.future()
        timeout = int(max([1, timeout]) * 1000)
        period = int(min([2, timeout / 2]) * 1000000)

        def get_data(keys):
            try:
                data = {}
                for key in keys:
                    data[key] = self.s.ALMemory.getData(key)
                self.store_data.setValue(data)
            except RuntimeError as err:
                self.logger.warning(err)

        get_data_task = qi.PeriodicTask()
        get_data_task.setCallback(partial(get_data, keys))
        get_data_task.setUsPeriod(period)
        get_data_task.start(True)

        try:
            self.store_data_fut.value(timeout)
            get_data_task.stop()
        except RuntimeError:
            get_data_task.stop()
            raise RuntimeError(
                'Failed to get store data after {} ms'.format(timeout))
        return self.store_data_fut.value()

    def _store_catalog(self, catalog):
        for item in catalog:
            self.catalog.append({field[0]: field[1] for field in item})
        products = [item['product_name_sanitized'] for item in self.catalog]
        self.s.ALDialog.setConcept('catalog', self.language, products)
        alternates = [alternate for item in self.catalog for alternate in item['alternate']]
        self.logger.info('Alternate product names: {}'.format(alternates))
        self.s.ALDialog.setConcept('alternates', self.language, alternates)

    def _store_keywords(self, sections):
        for section in sections:
            name, keywords = section[0], section[1][1]
            self.keywords[name] = keywords
            self.s.ALDialog.setConcept(name, self.language, keywords)

    @qi.nobind
    def _check_daps(self):

        #clean the ALMemory
        try:
            self.s.ALMemory.removeData('KhanTherapy/DapsInstalled')
        except RuntimeError:
            pass

        try:
            if self.s.Daps is not None:
                self.logger.info('Daps library is installed')
                self.s.ALMemory.insertData('KhanTherapy/DapsInstalled', 'true') #use in dialog, highfive part
        except:
            self.logger.info('Daps library is not installed')
     
    @qi.nobind
    def _start_behavior(self, e):

        if e :

            try:
                self.s.ALBehaviorManager.runBehavior('%s/%s' % (self.PKG_ID, "reflexes/Lfrontbumper"))
            except:
                pass

    @qi.nobind
    def _bind_touch_reflexes(self):
        def getBehaviorCallBack(self, bh):
            def behaviorCallBack(e, *args):

                try:
                    # re-enable hand stiffness
                    self.s.ALMotion.setStiffnesses(["LHand", "RHand"], 1.0)

		    # save robot position
                    pos = self.s.ALMotion.getAngles("Body", False)

                    self.s.ALBehaviorManager.runBehavior('%s/%s' % (self.PKG_ID, bh))

                    # restore robot position
                    self.s.ALMotion.angleInterpolation("Body", pos, 0.5, True)
                except:
                    pass
                finally:
                    # disable stiffness after animation
                    self.s.ALMotion.setStiffnesses(["LHand", "RHand"], 0.0)
            return behaviorCallBack

        self.events.connect('LeftBumperPressed', getBehaviorCallBack(self, "reflexes/Lfrontbumper"))
        self.events.connect('RightBumperPressed', getBehaviorCallBack(self, "reflexes/Rfrontbumper"))
        self.events.connect('BackBumperPressed', getBehaviorCallBack(self, "reflexes/Rfrontbumper"))
        self.events.connect('HandLeftBackTouched', getBehaviorCallBack(self, "reflexes/Lhand"))
        self.events.connect('HandLeftLeftTouched', getBehaviorCallBack(self, "reflexes/Lhand"))
        self.events.connect('HandLeftRightTouched', getBehaviorCallBack(self, "reflexes/Lhand"))
        self.events.connect('HandRightLeftTouched', getBehaviorCallBack(self, "reflexes/Rhand"))
        self.events.connect('HandRightRightTouched', getBehaviorCallBack(self, "reflexes/Rhand"))
        self.events.connect('HandRightBackTouched', getBehaviorCallBack(self, "reflexes/Rhand"))
        self.events.connect('FrontTactilTouched', getBehaviorCallBack(self, "reflexes/head"))
        self.events.connect('MiddleTactilTouched', getBehaviorCallBack(self, "reflexes/head"))
        
        self.events.connect('ALTabletService.onTouchDown', getBehaviorCallBack(self, "reflexes/tablet"))

    @qi.nobind
    def _bind_no_hand_stiff(self):

        def enableStiff(self):
            def _enableStiff(e, *args):
                if e:
                    self.s.ALMotion.setStiffnesses(["LHand", "RHand"], 1.0)
            return _enableStiff
        self.events.connect('ALTextToSpeech/TextStarted', enableStiff(self))

        def disableStiff(self):
            def _disableStiff(e, *args):
                if e:
                    self.s.ALMotion.setStiffnesses(["LHand", "RHand"], 0.0)
            return _disableStiff
        self.events.connect('ALTextToSpeech/TextDone', disableStiff(self))
        

    @qi.nobind
    def start_greeter(self, evt=None):
        # pause ASR
        self.s.ALSpeechRecognition.pause(True)
        #
        self.s.ALMemory.raiseEvent('KhanTherapy/goto', 'logo')
        # start behavior
        try:
            self.s.ALBehaviorManager.runBehavior("%s/greeter" % self.PKG_ID)
        except:
            pass
        # resume ASR / jump to welcome
        self.s.ALSpeechRecognition.pause(False)
        self.s.ALMemory.raiseEvent('KhanTherapy/goto', '')
        self.s.ALDialog.gotoTag("welcome", "BestBuy")

    @qi.nobind
    def set_safety_off(self, evt=None):
        self.s.ALMotion.setCollisionProtectionEnabled('Arms', False)
        self.s.ALMotion.setExternalCollisionProtectionEnabled('All', False)
        self.logger.info('Safety disabled')


    @qi.nobind
    def set_safety_on(self, evt=None):
        self.s.ALMotion.setCollisionProtectionEnabled('Arms', True)
        self.s.ALMotion.setExternalCollisionProtectionEnabled('All', True)
        self.logger.info('Safety enabled')


####################
# Setup and Run
####################

if __name__ == '__main__':
    stk.runner.run_activity(KhanTherapy)
