namespace Audible.Interfaces.Provider
{
    public interface IPiCalculatorFactory
    {
        IPiCalculator CalculatedPi { get; }

        IPiCalculator StreamedPi { get; }
    }
}