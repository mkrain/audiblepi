using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;

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

using ConfigKey = Audible.Interfaces.ConfigKey;

namespace Audible.ViewModel
{
    public sealed class SettingsViewModel : ViewModelBase, ISettingsViewmodel
    {
        private uint _currentDigit;
        private string _x;
        private CalculatingStage _currentStage;
        private readonly INoteProvider _noteProvider;
        private readonly IPiModel _model;
        private readonly int _noteCount;
        private int _previousSelectedDigits;

        private static readonly List<int> _skipDigits = new List<int> { 1, 5, 10, 25, 100, 1000 };
        private static readonly List<int> _notePlayInterval = new List<int> { 2000, 1000, 500, 250, 125 };
        

        public RelayCommand CancelCalcuationCommand { get; private set; }

        public RelayCommand CycleSelectedInstrumentCommand { get; private set; }

        public override string ImageIconUri
        {
            get { return "/Images/Settings.png"; }
        }

        public string InstrumentIconUri
        {
            get
            {
                return this.SelectedNoteType.ImageUri ?? "/Images/Instruments/Piano.Icon.png";
            }
        }

        public string CurrentDigit
        {
            get
            {
                return _currentStage == CalculatingStage.Pi ?
                    string.Format(
                        StringKey.FormatStrings.ViewModel.Settings.CurrentDigit.Pi, 
                        _currentDigit, 
                        SelectedNumberOfDigits) :
                    string.Format(
                        StringKey.FormatStrings.ViewModel.Settings.CurrentDigit.ArcTan, 
                        _x, 
                        _currentDigit);
            }
        }

        public NoteType SelectedNoteType
        {
            get { return (NoteType)Configuration[ConfigKey.SelectedNoteType]; }
            set
            {
                var oldValue = SelectedNoteType;

                if (oldValue == value)
                    return;

                Configuration[ConfigKey.SelectedNoteType] = value;

                RaisePropertyChanged(ConfigKey.SelectedNoteType);
                RaisePropertyChanged("InstrumentIconUri");
                Messenger.Default.Send(
                    new NoteTypeChangedMessage(value, this, ConfigKey.SelectedNoteType));
            }
        }

        public IEnumerable<NoteType> NoteTypes { get { return _noteProvider.NoteTypes; } }
        
        public Visibility IsCalculating { get; set; }
        public Visibility ContentVisiblity { get; set; }

        public IEnumerable<int> SkipDigits
        {
            get { return _skipDigits; }
        }

        public IEnumerable<int> SupportedDigits
        {
            get { return _model.SupportedDigits; }
        }

        public IEnumerable<int> NotePlayInterval
        {
            get { return _notePlayInterval; }
        }

        public int SelectedNumberOfDigits
        {
            get { return Configuration.Get<int>(ConfigKey.SelectedNumberOfDigits); }
            set
            {
                var oldValue = SelectedNumberOfDigits;

                if( oldValue == value )
                    return;

                Configuration[ConfigKey.SelectedNumberOfDigits] = value;

                if( _previousSelectedDigits == value )
                    return;
                
                RaisePropertyChanged(ConfigKey.SelectedNumberOfDigits);

                Messenger.Default.Send(
                    new PiPrecisionDigitSettingMessage(value, this, ConfigKey.SelectedNumberOfDigits));
            }
        }

        public bool IsPiComputed
        {
            get { return Configuration.Get<bool>(ConfigKey.IsPiComputed); }
            set
            {
                var oldValue = IsPiComputed;

                if( oldValue == value )
                    return;

                Configuration[ConfigKey.IsPiComputed] = value;

                Messenger.Default.Send(
                    new IsPiComputedChangedMessage(value, this, ConfigKey.IsPiComputed));

                RaisePropertyChanged(ConfigKey.IsPiComputed);
            }
        }

        public bool IsBase10
        {
           get { return Configuration.Get<bool>(ConfigKey.IsBase10); }
            set
            {
                var oldValue = IsBase10;

                if( oldValue == value )
                    return;

                Configuration[ConfigKey.IsBase10] = value;

                Messenger.Default.Send(
                    new Base10ChangedMessage(value, this, ConfigKey.IsBase10));

                RaisePropertyChanged(ConfigKey.IsBase10);
            }
        }

        public bool IsSoundLooped
        {
            get
            {
                return Configuration.Get<bool>(ConfigKey.IsSoundLooped); 
            }
            set
            {
                var oldValue = Configuration.Get<bool>(ConfigKey.IsSoundLooped);

                if (oldValue == value)
                    return;

                Configuration[ConfigKey.IsSoundLooped] = value;

                RaisePropertyChanged(ConfigKey.IsSoundLooped);

                Messenger.Default.Send(
                    new IsSoundLoopedSettingMessage(value, this, ConfigKey.IsSoundLooped));
            }
        }

        public int SelectedSkipDigit
        {
            get { return Configuration.Get<int>(ConfigKey.SelectedSkipDigit); }
            set
            {
                var oldValue = SelectedSkipDigit;

                if (oldValue == value)
                    return;

                Configuration[ConfigKey.SelectedSkipDigit] = value;

                RaisePropertyChanged(ConfigKey.SelectedSkipDigit);
                Messenger.Default.Send(
                    new PiSkipDigitSettingMessage(value, this, ConfigKey.SelectedSkipDigit));
            }
        }

        public int SelectedTempo
        {
            get { return Configuration.Get<int>(ConfigKey.SelectedTempo); }
            set
            {
                var oldValue = SelectedTempo;

                if (oldValue == value)
                    return;

                Configuration[ConfigKey.SelectedTempo] = value;

                RaisePropertyChanged(ConfigKey.SelectedTempo);

                Messenger.Default.Send(
                    new NoteIntervalChangedMessage(value, this, ConfigKey.SelectedTempo));
            }
        }

        #region Overrides of ViewModelBase

        public override string PageName
        {
            get { return StringKey.ViewModel.Settings.PageName; }
        }

        #endregion

        public SettingsViewModel(
            IPiModel model,
            INoteProvider noteProvider,
            IPhoneConfiguration phoneConfiguration): base(phoneConfiguration)
        {
            if( noteProvider == null )
                throw new ArgumentNullException("noteProvider");
            if( model == null )
                throw new ArgumentNullException("model");

            _model = model;
            _noteProvider = noteProvider;

            _noteCount = _noteProvider.NoteTypes.Count();

            this.CycleSelectedInstrumentCommand = new RelayCommand(CycleInstrumentSelected);
            this.CancelCalcuationCommand = 
                new RelayCommand( 
                    () =>
                    {
                        HidePopup();
                        Messenger.Default.Send(new CanceledMessage());
                        SelectedNumberOfDigits = _previousSelectedDigits;
                    });

            RegisterMessageHandlers();

            RegisterDefaultConfigurationSettings();

            RaisePropertyChanged(ConfigKey.SelectedNoteType);
                Messenger.Default.Send(
                    new NoteTypeChangedMessage(this.SelectedNoteType, this, ConfigKey.SelectedNoteType));

            RaiseDefaultSettingsMessages();
        }

        private void RegisterMessageHandlers()
        {
            Messenger.Default.Register<StartingMessage>(
                this, 
                PiCalculatedStarted);
            Messenger.Default.Register<StoppingMessage>(
                this, 
                PiCalculatedFinished);
            Messenger.Default.Register<CalculatingMessage>(
                this,
                PiCalculating);
            Messenger.Default.Register<CalculatingArcTanMessage>(
                this,
                this.ArcTanCalculating);

            Messenger.Default.Register<PiCalculatorChangedMessage>(
                this,
                this.PiCalculatorChanged);
        }

        private void RegisterDefaultConfigurationSettings()
        {
            if( !base.Configuration.ContainsKey(ConfigKey.SelectedSkipDigit) )
                base.Configuration.Add(ConfigKey.SelectedSkipDigit, _skipDigits.First());
            if( !base.Configuration.ContainsKey(ConfigKey.SelectedTempo) )
                base.Configuration.Add(ConfigKey.SelectedTempo, _notePlayInterval.First());
            if( !base.Configuration.ContainsKey(ConfigKey.IsSoundLooped) )
                base.Configuration.Add(ConfigKey.IsSoundLooped, false);
            if( !Configuration.ContainsKey(ConfigKey.SelectedNumberOfDigits) )
                Configuration.Add(ConfigKey.SelectedNumberOfDigits, SupportedDigits.First());
            if( !Configuration.ContainsKey(ConfigKey.SelectedNoteType) )
            {
                Configuration.Add(ConfigKey.SelectedNoteType, _noteProvider.NoteTypes.First());
                this.SelectedNoteType = _noteProvider.NoteTypes.First();
            }

            var min = SupportedDigits.Min();

            if( this.SelectedNumberOfDigits < min )
                this.SelectedNumberOfDigits = min;

            min = _notePlayInterval.Min();

            if( this.SelectedTempo < min )
                this.SelectedTempo = min;

            min = _skipDigits.Min();

            if( this.SelectedSkipDigit < min )
                this.SelectedSkipDigit = min;

            _previousSelectedDigits = SelectedNumberOfDigits;

            this.SelectedTempo = SelectedTempo;
            this.SelectedSkipDigit = SelectedSkipDigit;
            this.IsSoundLooped = this.IsSoundLooped;
            this.IsCalculating = Visibility.Collapsed;
        }

        private void RaiseDefaultSettingsMessages()
        {
            Messenger.Default.Send(
                new NoteTypeChangedMessage(this.SelectedNoteType, this, ConfigKey.SelectedNoteType));

            Messenger.Default.Send(
                new IsPiComputedChangedMessage(this.IsPiComputed, this, ConfigKey.IsPiComputed));

            Messenger.Default.Send(
                new PiPrecisionDigitSettingMessage(this.SelectedNumberOfDigits, this, ConfigKey.SelectedNumberOfDigits));

            Messenger.Default.Send(
                new Base10ChangedMessage(this.IsBase10, this, ConfigKey.IsBase10));

            Messenger.Default.Send(
                new IsSoundLoopedSettingMessage(this.IsSoundLooped, this, ConfigKey.IsSoundLooped));

            Messenger.Default.Send(
                    new PiSkipDigitSettingMessage(this.SelectedSkipDigit, this, ConfigKey.SelectedSkipDigit));

            Messenger.Default.Send(
                    new NoteIntervalChangedMessage(this.SelectedTempo, this, ConfigKey.SelectedNoteInterval));
        }

        private void CycleInstrumentSelected()
        {
            var selected = this.SelectedNoteType.Id;

            selected = ( selected + 1 ) % _noteCount;

            var next = _noteProvider.NoteTypes.First(nt => nt.Id == selected);

            this.SelectedNoteType = next;
        }

        private void PiCalculatorChanged(PiCalculatorChangedMessage message)
        {
            if( SupportedDigits.Contains(this.SelectedNumberOfDigits) )
                return;

            Scheduler.Immediate.Schedule(
                () => this.RaisePropertyChanged(ConfigKey.SupportedDigits));
            
            this.SelectedNumberOfDigits = SupportedDigits.First();
            _previousSelectedDigits = this.SelectedNumberOfDigits;

            RaisePropertyChanged(ConfigKey.SelectedNumberOfDigits);
        }

        private void PiCalculatedStarted(StartingMessage message)
        {
            ShowPopup();
        }

        private void PiCalculatedFinished(StoppingMessage message)
        {
            _previousSelectedDigits = SelectedNumberOfDigits;

            HidePopup();
        }

        private void PiCalculating(CalculatingMessage message)
        {
            _currentDigit = (uint)message.Data;

            _currentStage = CalculatingStage.Pi;

            RaisePropertyChanged(ConfigKey.Update.CurrentDigit);
        }

        private void ArcTanCalculating(CalculatingArcTanMessage message)
        {
            _currentDigit = message.Data;
            _x = message.Key;

            if( this.ContentVisiblity == Visibility.Visible )
                this.ShowPopup();

            _currentStage = CalculatingStage.ArcTan;

            RaisePropertyChanged(ConfigKey.Update.CurrentDigit);
        }

        private void ShowPopup()
        {
            Scheduler.Dispatcher.Schedule(
                () =>
                {
                    this.IsCalculating = Visibility.Visible;
                    this.ContentVisiblity = Visibility.Collapsed;

                    RaisePropertyChanged(ConfigKey.Update.ContentVisiblity);
                    RaisePropertyChanged(ConfigKey.Update.IsCalculating);
                });
        }

        private void HidePopup()
        {
            Scheduler.Dispatcher.Schedule(
                () =>
                {
                    this.IsCalculating = Visibility.Collapsed;
                    this.ContentVisiblity = Visibility.Visible;

                    RaisePropertyChanged(ConfigKey.Update.ContentVisiblity);
                    RaisePropertyChanged(ConfigKey.Update.IsCalculating);
                    RaisePropertyChanged(ConfigKey.SelectedNumberOfDigits);
                });
        }
    }

    internal enum CalculatingStage
    {
        Pi,
        ArcTan
    }
}