using System;
using System.Collections.Generic;

using Audible.Interfaces.Messages.PiCalculator;
using Audible.Interfaces.Messages.Settings;
using Audible.Interfaces.Model;
using Audible.Interfaces.Provider;

using GalaSoft.MvvmLight.Messaging;

namespace Audible.Model
{
    public class PiModel : IPiModel
    {
        private readonly IPiCalculatorFactory _piFactory;
        private bool _isPreComputed;

        private readonly Dictionary<string, object> _delegates = 
            new Dictionary<string, object>
            {
                { "PiCalculatedEvent", null },
                { "CurrentDigitCalculatedEvent", null },
                { "CurrentArcTanDivisorCalculatedEvent", null }
            };

        public IEnumerable<int> SupportedDigits
        {
            get { return SelectedPiCalculator.SupportedDigits; }
        }

        public event EventHandler<PiCalculatedEventArgs> PiCalculatedEvent
        {
            add
            {
                SelectedPiCalculator.PiCalculatedEvent += value;
                _delegates["PiCalculatedEvent"] = value;
            }
            remove 
            { 
                SelectedPiCalculator.PiCalculatedEvent -= value; 
                _delegates["PiCalculatedEvent"] = null;
            }
        }

        public event EventHandler<CalculatingPiEventArgs> CurrentDigitCalculatedEvent
        {
            add
            {
                SelectedPiCalculator.CurrentDigitCalculatedEvent += value;
                _delegates["CurrentDigitCalculatedEvent"] = value;
            }
            remove
            {
                SelectedPiCalculator.CurrentDigitCalculatedEvent -= value;
                _delegates["CurrentDigitCalculatedEvent"] = null;
            }
        }

        public event EventHandler<CalculatingArcTanEventArgs> CurrentArcTanDivisorCalculatedEvent
        {
            add
            {
                SelectedPiCalculator.CurrentArcTanDivisorCalculatedEvent += value;
                _delegates["CurrentArcTanDivisorCalculatedEvent"] = value;
            }
            remove
            {
                SelectedPiCalculator.CurrentArcTanDivisorCalculatedEvent -= value;
                _delegates["CurrentArcTanDivisorCalculatedEvent"] = null;
            }
        }

        private IPiCalculator SelectedPiCalculator
        {
            get { return _isPreComputed ? _piFactory.StreamedPi : _piFactory.CalculatedPi; }
        }


        public PiModel(IPiCalculatorFactory piFactory)
        {
            _piFactory = piFactory;

            RegisterMessageHandlers();
        }

        private void RegisterMessageHandlers()
        {
            Messenger.Default.Register<IsPiComputedChangedMessage>(
                this,
                IsPiComputedChangedMessageHandler);
        }

        private void IsPiComputedChangedMessageHandler(IsPiComputedChangedMessage message)
        {
            //Get the event handlers from the last pi calculator
            var piCalculatedEvent =
                (EventHandler<PiCalculatedEventArgs>)_delegates["PiCalculatedEvent"];
            var currentDigitEvent =
                (EventHandler<CalculatingPiEventArgs>)_delegates["CurrentDigitCalculatedEvent"];
            var currentArcTanEvent =
                (EventHandler<CalculatingArcTanEventArgs>)_delegates["CurrentArcTanDivisorCalculatedEvent"];

            //Remove the handlers from the calculator
            this.PiCalculatedEvent -= piCalculatedEvent;
            this.CurrentDigitCalculatedEvent -= currentDigitEvent;
            this.CurrentArcTanDivisorCalculatedEvent -= currentArcTanEvent;

            //Update to the new calculator
            _isPreComputed = message.Data;

            //Add the handlers to the new calculator
            this.PiCalculatedEvent += piCalculatedEvent;
            this.CurrentDigitCalculatedEvent += currentDigitEvent;
            this.CurrentArcTanDivisorCalculatedEvent += currentArcTanEvent;

            Messenger.Default.Send(new PiCalculatorChangedMessage(true, this));
        }

        #region IPiCalculator

        public ComputedPi DefaultComputedBase10Pi
        {
            get { return SelectedPiCalculator.DefaultComputedBase10Pi; }
        }

        public ComputedPi DefaultComputedBase12Pi
        {
            get { return SelectedPiCalculator.DefaultComputedBase12Pi; }
        }

        public void CalculatePiAsDecimal(int rounds)
        {
            SelectedPiCalculator.CalculatePiAsDecimal(rounds);
        }

        public void CalculatePiAsBase12(int rounds)
        {
            SelectedPiCalculator.CalculatePiAsBase12(rounds);
        }

        public bool IsCalculating
        {
            get { return SelectedPiCalculator.IsCalculating; }
        }

        public void Cancel()
        {
            SelectedPiCalculator.Cancel();
        }

        #endregion
    }
}