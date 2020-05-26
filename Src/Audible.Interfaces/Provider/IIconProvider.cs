using System.Windows.Media.Imaging;

namespace Audible.Interfaces.Provider
{
    public interface IIconProvider
    {
        BitmapImage PlayIcon { get; }
        BitmapImage PauseIcon { get; }
    }
}