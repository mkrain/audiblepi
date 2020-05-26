
using System.Collections.Generic;

using Audible.Interfaces.Model;
using Audible.Interfaces.Provider;

using Common.Configuration;

using Moq;

namespace Audible.Tests.ViewModel
{
    public class ViewModelBaseFixture
    {
        private static readonly Note _defaultNote = new Note { Name = "A#", Uri = "/Uri/Fake/Fake" };

        public PiCalculatedEventArgs SmallPiCalculatedEvetArgs
        {
            get
            {
                return new PiCalculatedEventArgs(
                        new ComputedPi(
                            new List<char>{ '3', '1', '4' }));
            }
        }

        public Note DefaultNote { get { return _defaultNote; } }

        public Mock<IPhoneConfiguration> Configuration { get; private set; }
        public Mock<IPiModel> PiModel { get; private set; }
        public Mock<IIconProvider> IconProvider { get; private set; }
        public Mock<INoteModel> NoteModel { get; private set; }
        public Mock<INoteProvider> NoteProvider { get; private set; }

        public ViewModelBaseFixture()
        {
            this.Configuration = new Mock<IPhoneConfiguration>();
            this.PiModel = new Mock<IPiModel>();
            this.IconProvider = new Mock<IIconProvider>();
            this.NoteModel = new Mock<INoteModel>();
            this.NoteProvider = new Mock<INoteProvider>();

            this.PiModel
                .Setup(pm => pm.SupportedDigits)
                .Returns(new List<int>{ 1, 2, 3, 4 });
        }
    }
}