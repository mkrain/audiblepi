namespace Audible.Interfaces.Provider
{
    public interface IAdProvider
    {
        string AdUnitId { get; }
        string ApplicationId { get; }

        int Height { get; }
        int Width { get; }
    }
}