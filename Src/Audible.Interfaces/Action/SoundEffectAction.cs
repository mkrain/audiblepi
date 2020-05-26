using System.Windows;
using System.Windows.Interactivity;

using Audible.Interfaces.Provider;

using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Audio;

namespace Audible.Interfaces.Action
{
    public class SoundEffectAction : TriggerAction<FrameworkElement>
    {
        public Note Source
        {
            get { return (Note)GetValue(SourceProperty); }
            set { SetValue(SourceProperty, value); }
        }

        public static readonly DependencyProperty SourceProperty = DependencyProperty.Register(
            "Source",
            typeof( Note ),
            typeof( SoundEffectAction ),
            new PropertyMetadata(null));

        protected override void Invoke(object parameter)
        {
            if( this.Source == null || string.IsNullOrEmpty(this.Source.Uri) )
                return;

            var stream = TitleContainer.OpenStream(this.Source.Uri);

            if( stream == null )
                return;

            var effect = SoundEffect.FromStream(stream);
            FrameworkDispatcher.Update();
            effect.Play();
        }
    }
}