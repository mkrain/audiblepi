using System;
using System.Collections.Generic;
using System.Linq;

using Audible.Interfaces.Model;
using Audible.Interfaces.Provider;
using Audible.Interfaces.ViewModel;


namespace Audible.ViewModel
{
    public class NoteViewModel : GalaSoft.MvvmLight.ViewModelBase, INoteViewModel
    {
        private readonly INoteModel _model;
        private Note _selected;

        public IEnumerable<Note> Notes
        {
            get { return _model.Notes.OrderBy(n => int.Parse(n.Id)); }
        }

        public Note SelectedNote
        {
            get { return _selected ?? _model.Notes.First(); }
            set
            {
                _selected = value; 
                RaisePropertyChanged("SelectedNote");
            }
        }

        public NoteViewModel(INoteModel model)
        {
            if( model == null )
                throw new ArgumentNullException("model");

            _model = model;
        }
    }
}