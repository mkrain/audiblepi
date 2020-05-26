using System;
using System.Collections.Generic;

namespace Audible.Interfaces.Provider
{
    public interface IPiCalculator
    {
        ComputedPi DefaultComputedBase10Pi { get; }
        ComputedPi DefaultComputedBase12Pi { get; }

        void CalculatePiAsDecimal(int rounds);

        void CalculatePiAsBase12(int rounds);

        bool IsCalculating { get; }

        void Cancel();

        IEnumerable<int> SupportedDigits { get;  }

        event EventHandler<PiCalculatedEventArgs> PiCalculatedEvent;
        event EventHandler<CalculatingPiEventArgs> CurrentDigitCalculatedEvent;
        event EventHandler<CalculatingArcTanEventArgs> CurrentArcTanDivisorCalculatedEvent;
    }

    public enum PiConversionOption
    {
        Undefined = 0,
        Decimal,
        Base12
    }
}