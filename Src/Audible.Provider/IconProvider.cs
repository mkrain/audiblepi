using System.Windows.Media.Imaging;

using Audible.Interfaces.Provider;

namespace Audible.Provider
{
    public class IconProvider : IIconProvider
    {
        private const string FILE_EXTENSION = "png";
        private const string PLAYER_ICON_IMAGE = "Audible.Provider.Images.Player.Play." + FILE_EXTENSION;
        private const string PAUSE_ICON_IMAGE = "Audible.Provider.Images.Player.Pause." + FILE_EXTENSION;

        public BitmapImage PlayIcon
        {
            get { return GetPlayIcon(); }
        }

        public BitmapImage PauseIcon
        {
            get { return this.GetPauseIcon(); }
        }

        public IconProvider()
        {
            
        }

        private BitmapImage GetPlayIcon()
        {
            var stream = this.GetType().Assembly.GetManifestResourceStream(PLAYER_ICON_IMAGE);
            
            var bitmap = new BitmapImage { CreateOptions = BitmapCreateOptions.None };
            bitmap.SetSource(stream);

            return bitmap;
        }

        private BitmapImage GetPauseIcon()
        {
            var stream = this.GetType().Assembly.GetManifestResourceStream(PAUSE_ICON_IMAGE);

            var bitmap = new BitmapImage { CreateOptions = BitmapCreateOptions.None };
            bitmap.SetSource(stream);

            return bitmap;
        }
    }
}