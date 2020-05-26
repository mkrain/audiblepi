using System;
using System.IO;
using System.Windows.Media.Imaging;

using Audible.Interfaces;
using Audible.Interfaces.Messages.PiCalculator;
using Audible.Interfaces.Messages.Settings;
using Audible.Interfaces.Model;
using Audible.Interfaces.Provider;
using Audible.Interfaces.ViewModel;

using Common.Configuration;

using GalaSoft.MvvmLight.Command;
using GalaSoft.MvvmLight.Messaging;

using Microsoft.Phone.Reactive;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Audio;

namespace Audible.ViewModel
{
    public class PiViewModel : ViewModelBase, IPiViewModel
    {
        private IPiIterator<string> _piString;
        protected bool _isPlaying;
        protected bool _cancel;
        protected bool _isCalculating;
        protected bool _isBase10;
        private bool _isSoundLooped;
        private int _selectedSkipDigit = 1;
        private readonly GameTimer _timer;

        //Microsoft.Xna.Framework.Media.MediaLibrary _library = new Microsoft.Xna.Framework.Media.MediaLibrary();

        private readonly IIconProvider _iconProvider;
        private readonly IPiModel _piModel;
        private readonly INoteModel _model;

        protected int CurrentIndex { get;  set; }

        public Note PreviousValue
        {
            get { return GetPreviousPiNote(); }
        }

        public Note CurrentValue
        {
            get
            {
                return GetCurrentPiNote();
            }
        }

        public Note NextValue
        {
            get { return this.GetNextPiNote(); }
        }

        public string PlayingCount
        {
            get
            {
                return string.Format(
                    StringKey.FormatStrings.ViewModel.Pi.PlayingCount, 
                    CurrentIndex + 1,
                    _piString == null ? 0 :
                    _piString.Length);
            }
        }

        public BitmapImage PlayIcon
        {
            get
            {
                if( _isPlaying )
                    return _iconProvider.PauseIcon;
                return _iconProvider.PlayIcon;
            }
        }

        public string BusyIconUri
        {
            get
            {
                return _isCalculating ? "/Images/Busy.Icon.png" : string.Empty;
            }
        }

        public string MusicIconUri
        {
            get { return _isPlaying ? "/Images/Music.png" : string.Empty; }
        }

        public override string ImageIconUri
        {
            get { return "/Images/Music.png"; }
        }

        public string BaseCalculation
        {
            get { return _isBase10 ? "10" : "12"; }
        }

        #region Overrides of ViewModelBase

        public override string PageName
        {
            get { return StringKey.ViewModel.Pi.PageName; }
        }

        #endregion

        public RelayCommand PreviousStringCommand { get; private set; }
        public RelayCommand NextStringCommand { get; private set; }
        public RelayCommand PlaySoundCommand { get; private set; }


        public PiViewModel(
            IPiModel piModel,
            IIconProvider iconProvider,
            INoteModel model,
            IPhoneConfiguration phoneConfiguration) : base(phoneConfiguration)
        {
            if( piModel == null )
                throw new ArgumentNullException("piModel");
            if (iconProvider == null)
                throw new ArgumentNullException("iconProvider");
            if( model == null )
                throw new ArgumentNullException("model");

            _piModel = piModel;
            _iconProvider = iconProvider;
            _model = model;

            _piString = _piModel.DefaultComputedBase12Pi;

            _timer = 
                new GameTimer
                {
                    UpdateInterval = new TimeSpan(0, 0, 0, 0, 1000)
                };

            _timer.Update += this.OnTimerElapsed;

            this.PreviousStringCommand = new RelayCommand(this.MoveToPreviousPiString);
            this.NextStringCommand = new RelayCommand(this.MoveToNextPiString);
            this.PlaySoundCommand = new RelayCommand(this.PlayPiSound);

            RegisterMessageHandlers();

            _piModel.PiCalculatedEvent += this.PiCalculated;
            _piModel.CurrentDigitCalculatedEvent += this.CurrentPiCalcuatedEventHandler;
            _piModel.CurrentArcTanDivisorCalculatedEvent += this.CurrentArcTanCalcuatedEventHandler;

#if Release
            PhoneApplicationService.Current.ApplicationIdleDetectionMode = IdleDetectionMode.Disabled;
#endif
        }

        private void RegisterMessageHandlers()
        {
            Messenger.Default.Register<PiPrecisionDigitSettingMessage>(
                this,
                PiDigitsChanged);
            Messenger.Default.Register<PiSkipDigitSettingMessage>(
                this,
                this.SelectedSkipDigitChanged);
            Messenger.Default.Register<NoteIntervalChangedMessage>(
                this,
                this.NoteIntervalChanged);
            Messenger.Default.Register<IsSoundLoopedSettingMessage>(
                this,
                this.IsSoundLoopedChanged);
            Messenger.Default.Register<CanceledMessage>(
                this,
                this.CancelCalculation);
            Messenger.Default.Register<Base10ChangedMessage>(
                this,
                m =>
                {
                    _isBase10 = m.Data;
                    RaisePropertyChanged(ConfigKey.BaseCalculation);
                });
        }

        private void PiDigitsChanged(PiPrecisionDigitSettingMessage updatedValue)
        {
            this.StartPiCalculation(updatedValue.Data);
        }

        private void StartPiCalculation(int digits)
        {
//#if Release
//            Scheduler.Dispatcher.Schedule(
//                () =>
//#else
//            ThreadPool.QueueUserWorkItem(
//                x =>
//#endif
            Scheduler.Dispatcher.Schedule(
                () =>
                Messenger.Default.Send(new StartingMessage()));

            _isCalculating = true;
            _cancel = false;

            //if( _isBase10 )
            _piModel.CalculatePiAsBase12(digits);
            //else
            //    _piModel.CalculatePiAsDecimal(digits);

            RaisePropertyChanged("BusyIconUri");
        }

        private void CurrentPiCalcuatedEventHandler(object sender, CalculatingPiEventArgs e)
        {
            Scheduler.Dispatcher.Schedule(
                () => Messenger.Default.Send(new CalculatingMessage(e.CurrentDigit)));
        }

        private void CurrentArcTanCalcuatedEventHandler(object sender, CalculatingArcTanEventArgs e)
        {
            Scheduler.Dispatcher.Schedule(
                () => Messenger.Default.Send(new CalculatingArcTanMessage(e.Divisor, this, e.X)));
        }

        private void NoteIntervalChanged(NoteIntervalChangedMessage message)
        {
            _timer.UpdateInterval = new TimeSpan(0, 0, 0, 0, message.Data);
        }

        private void IsSoundLoopedChanged(IsSoundLoopedSettingMessage message)
        {
            _isSoundLooped = message.Data;

            if( _piString != null && CurrentIndex >= _piString.Length - 1 )
                ResetNoteToBeginning();
        }

        private void SelectedSkipDigitChanged(PiSkipDigitSettingMessage message)
        {
            _selectedSkipDigit = message.Data;
        }

        private void CancelCalculation(CanceledMessage message)
        {
            _cancel = true;
            _isCalculating = false;

            _piModel.Cancel();

            RaisePropertyChanged("BusyIconUri");
        }

        private void PiCalculated(object sender, PiCalculatedEventArgs args)
        {
            if( args != null && args.CalculatedPi != null )
                _piString = args.CalculatedPi;

            _isCalculating = false; 

//#if Release
//            Scheduler.Dispatcher.Schedule(
//                () =>
//#else
//            ThreadPool.QueueUserWorkItem(
//                x =>
//#endif
            Scheduler.Dispatcher.Schedule(
                () =>
                {
                    Messenger.Default.Send(new StoppingMessage());
                    RaisePropertyChanged("BusyIconUri");
                    ResetNoteToBeginning();
                });
         }

        private void OnTimerElapsed(object sender, EventArgs e)
        {
//#if Release
//            Scheduler.Dispatcher.Schedule(
//                () =>
//#else
//            ThreadPool.QueueUserWorkItem(
//                x =>
//#endif
            Scheduler.Dispatcher.Schedule(
                () =>
                {
                    this.PlayCurrentNote();
                    this.MoveToNextPiString();
                });
        }

        private void MoveToNextPiString()
        {
            if( _piString == null )
                return;

            if( CurrentIndex < _piString.Length - 1 )
            {
                var nextIndex = CurrentIndex + _selectedSkipDigit;

                CurrentIndex = nextIndex <= (int)_piString.Length - 1 ? nextIndex : (int)_piString.Length - 1;
            }
            else if( _isSoundLooped )
            {
                CurrentIndex = ( CurrentIndex + _selectedSkipDigit ) % (int)_piString.Length - 1;
            }

            _piString.Seek(CurrentIndex, SeekOrigin.Begin);

            RefreshPiText();
        }

        private void MoveToPreviousPiString()
        {
            if( _piString == null )
                return;
            if( this.CurrentIndex <= 0 )
                return;
            if( this.CurrentIndex - _selectedSkipDigit < 0 )
                this.CurrentIndex = 0;
            else
                this.CurrentIndex = (this.CurrentIndex - _selectedSkipDigit) % (int)_piString.Length;

            _piString.Seek(CurrentIndex, SeekOrigin.Begin);

            this.RefreshPiText();
        }

        private void PlayPiSound()
        {
            _isPlaying = !_isPlaying;

            if( _isPlaying )
            {
                _timer.Start();
                this.PlayCurrentNote();
            }
            else
            {
                _timer.Stop();
            }

            RaisePropertyChanged("MusicIconUri");
            RaisePropertyChanged("PlayIcon");
        }

        private void PlayCurrentNote()
        {
            var note = this.GetCurrentPiNote();

            if( note.Equals(_model.Blank) || string.IsNullOrEmpty(note.Uri) )
                return;

            PlaySelectedPiSound(note);
        }

        private void PlaySelectedPiSound(Note note)
        {
            if (note.Equals(_model.Blank) || string.IsNullOrEmpty(note.Uri))
                return;

            FrameworkDispatcher.Update();

            var stream = TitleContainer.OpenStream(note.Uri);
            var effect = SoundEffect.FromStream(stream);

            effect.Play();

            FrameworkDispatcher.Update();
        }

        private Note GetPreviousPiNote()
        {
            string note;

            if( _piString == null || CurrentIndex == 0 )
                note = string.Empty;
            else 
                note = _piString.Previous; //_piString[CurrentIndex - 1].ToString(CultureInfo.InvariantCulture);

            return _model.GetNoteFromName(note);
        }

        private Note GetCurrentPiNote()
        {
            string note = string.Empty;

            if( _piString == null )
                note = "3";
            else// if( CurrentIndex < _piString.Count )
                note = _piString.Current; //_piString[CurrentIndex].ToString(CultureInfo.InvariantCulture);

            return _model.GetNoteFromName(note);
        }

        private Note GetNextPiNote()
        {
            string note = string.Empty;

            if (_piString == null)
                note = string.Empty;
            else //if( CurrentIndex + 1 < _piString.Count )
                note = _piString.Next;//_piString[CurrentIndex + 1].ToString(CultureInfo.InvariantCulture);

            return _model.GetNoteFromName(note);
        }

        private void RefreshPiText()
        {
            RaisePropertyChanged("PreviousValue");
            RaisePropertyChanged("CurrentValue");
            RaisePropertyChanged("NextValue");
            RaisePropertyChanged("PlayingCount");
        }

        private void ResetNoteToBeginning()
        {
            CurrentIndex = 0;

            _piString.Seek(CurrentIndex, SeekOrigin.Begin);

            RefreshPiText();
        }
    }
}