using Audible.Interfaces.Provider;

namespace Audible.Interfaces.ViewModel
{
    public interface IPiViewModel : IPageViewModel
    {
        Note PreviousValue { get; }
        Note CurrentValue { get; }
        Note NextValue { get; }

        //string InstrumentIconUri { get; }
    }
}